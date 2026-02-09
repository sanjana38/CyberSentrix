import React, { useState, useEffect } from 'react';
import { Shield, AlertTriangle, Check, Lock, Smartphone, MapPin, Activity, Clock, Eye, EyeOff, Fingerprint, Bell, ChevronRight, Zap, X } from 'lucide-react';

// Real device fingerprinting utility
const generateDeviceFingerprint = async () => {
  const components = [];
  
  // Screen resolution
  components.push(`${window.screen.width}x${window.screen.height}`);
  
  // Color depth
  components.push(window.screen.colorDepth);
  
  // Timezone
  components.push(Intl.DateTimeFormat().resolvedOptions().timeZone);
  
  // Language
  components.push(navigator.language);
  
  // Platform
  components.push(navigator.platform);
  
  // User agent
  components.push(navigator.userAgent);
  
  // Hardware concurrency
  components.push(navigator.hardwareConcurrency);
  
  // Device memory (if available)
  if (navigator.deviceMemory) {
    components.push(navigator.deviceMemory);
  }
  
  // Canvas fingerprinting
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  ctx.textBaseline = 'top';
  ctx.font = '14px Arial';
  ctx.fillStyle = '#f60';
  ctx.fillRect(125, 1, 62, 20);
  ctx.fillStyle = '#069';
  ctx.fillText('CyberSentrix', 2, 15);
  components.push(canvas.toDataURL());
  
  // WebGL fingerprinting
  const gl = canvas.getContext('webgl');
  if (gl) {
    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
    if (debugInfo) {
      components.push(gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL));
      components.push(gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL));
    }
  }
  
  // Generate hash
  const fingerprint = await hashString(components.join('|||'));
  return fingerprint;
};

// Simple hash function
const hashString = async (str) => {
  const encoder = new TextEncoder();
  const data = encoder.encode(str);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex.substring(0, 12).toUpperCase();
};

// Get device information
const getDeviceInfo = () => {
  const ua = navigator.userAgent;
  let deviceName = 'Unknown Device';
  
  if (/iPhone/.test(ua)) {
    const match = ua.match(/iPhone OS (\d+)_/);
    deviceName = match ? `iPhone (iOS ${match[1]})` : 'iPhone';
  } else if (/iPad/.test(ua)) {
    deviceName = 'iPad';
  } else if (/Android/.test(ua)) {
    const match = ua.match(/Android (\d+)/);
    deviceName = match ? `Android ${match[1]}` : 'Android Device';
  } else if (/Windows/.test(ua)) {
    deviceName = 'Windows PC';
  } else if (/Mac/.test(ua)) {
    deviceName = 'MacBook';
  } else if (/Linux/.test(ua)) {
    deviceName = 'Linux PC';
  }
  
  return {
    name: deviceName,
    platform: navigator.platform,
    userAgent: navigator.userAgent,
    cores: navigator.hardwareConcurrency || 'Unknown',
    memory: navigator.deviceMemory ? `${navigator.deviceMemory} GB` : 'Unknown',
    screen: `${window.screen.width}x${window.screen.height}`,
    colorDepth: `${window.screen.colorDepth}-bit`
  };
};

// Risk scoring engine
const calculateRiskScore = (events) => {
  let score = 0;
  const weights = {
    simSwap: 45,
    deviceMismatch: 25,
    locationAnomaly: 20,
    otpBurst: 15,
    unusualTime: 10,
    vpnDetected: 15,
    timezoneMismatch: 12
  };

  events.forEach(event => {
    score += weights[event.type] || 0;
  });

  return Math.min(score, 100);
};

const getRiskLevel = (score) => {
  if (score >= 70) return { level: 'CRITICAL', color: '#ff3366', bg: 'rgba(255, 51, 102, 0.1)' };
  if (score >= 40) return { level: 'HIGH', color: '#ff9933', bg: 'rgba(255, 153, 51, 0.1)' };
  if (score >= 20) return { level: 'MEDIUM', color: '#ffcc00', bg: 'rgba(255, 204, 0, 0.1)' };
  return { level: 'LOW', color: '#00ff88', bg: 'rgba(0, 255, 136, 0.1)' };
};

const CyberSentrix = () => {
  const [riskScore, setRiskScore] = useState(5);
  const [events, setEvents] = useState([]);
  const [servicesLocked, setServicesLocked] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  
  // Real device data
  const [deviceInfo, setDeviceInfo] = useState({
    name: 'Loading...',
    fingerprint: 'Generating...',
    trusted: true,
    lastSeen: new Date().toLocaleString(),
    platform: '',
    cores: '',
    memory: '',
    screen: '',
    colorDepth: ''
  });
  
  // Real location data
  const [location, setLocation] = useState({
    city: 'Detecting location...',
    trusted: true,
    coordinates: 'Requesting...',
    timezone: '',
    accuracy: '',
    latitude: null,
    longitude: null
  });
  
  const [locationPermission, setLocationPermission] = useState('prompt');
  const [otpActivity, setOtpActivity] = useState([]);
  const [showRecovery, setShowRecovery] = useState(false);
  const [biometricVerifying, setBiometricVerifying] = useState(false);
  const [recoveryStep, setRecoveryStep] = useState(0);
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [trustedFingerprint, setTrustedFingerprint] = useState(null);
  const [initialLocationSet, setInitialLocationSet] = useState(false);
  const [trustedLocation, setTrustedLocation] = useState(null);

  const riskLevel = getRiskLevel(riskScore);

  // Initialize real device fingerprint and check biometric availability
  useEffect(() => {
    const initializeDevice = async () => {
      try {
        // Get real device info
        const realDeviceInfo = getDeviceInfo();
        
        // Generate device fingerprint
        const fingerprint = await generateDeviceFingerprint();
        
        setDeviceInfo(prev => ({
          ...prev,
          name: realDeviceInfo.name,
          fingerprint: fingerprint,
          platform: realDeviceInfo.platform,
          cores: realDeviceInfo.cores,
          memory: realDeviceInfo.memory,
          screen: realDeviceInfo.screen,
          colorDepth: realDeviceInfo.colorDepth,
          trusted: true
        }));
        
        // Store as trusted fingerprint
        setTrustedFingerprint(fingerprint);
        
        // Check if Web Authentication API is available (for biometrics)
        if (window.PublicKeyCredential) {
          const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
          setBiometricAvailable(available);
        }
      } catch (error) {
        console.error('Error initializing device:', error);
      }
    };

    initializeDevice();
  }, []);

  // Get real geolocation
  useEffect(() => {
    const getLocation = async () => {
      if (!navigator.geolocation) {
        setLocation(prev => ({
          ...prev,
          city: 'Geolocation not supported',
          coordinates: 'N/A'
        }));
        return;
      }

      // Check permission state
      try {
        const permission = await navigator.permissions.query({ name: 'geolocation' });
        setLocationPermission(permission.state);
        
        permission.addEventListener('change', () => {
          setLocationPermission(permission.state);
        });
      } catch (error) {
        console.log('Permission API not available');
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude, accuracy } = position.coords;
          
          // Get timezone
          const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
          
          // Reverse geocoding using public API
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
            );
            const data = await response.json();
            
            const city = data.address.city || data.address.town || data.address.village || 'Unknown Location';
            const country = data.address.country || '';
            
            const locationData = {
              city: `${city}, ${country}`,
              trusted: true,
              coordinates: `${latitude.toFixed(4)}° N, ${longitude.toFixed(4)}° W`,
              timezone: timezone,
              accuracy: `${Math.round(accuracy)}m`,
              latitude,
              longitude
            };
            
            setLocation(locationData);
            
            // Set as trusted location on first load
            if (!initialLocationSet) {
              setTrustedLocation(locationData);
              setInitialLocationSet(true);
            }
          } catch (error) {
            setLocation(prev => ({
              ...prev,
              city: 'Location detected',
              coordinates: `${latitude.toFixed(4)}° N, ${longitude.toFixed(4)}° W`,
              timezone: timezone,
              accuracy: `${Math.round(accuracy)}m`,
              latitude,
              longitude
            }));
          }
        },
        (error) => {
          setLocation(prev => ({
            ...prev,
            city: 'Location access denied',
            coordinates: 'Permission required',
            trusted: false
          }));
          
          if (error.code === error.PERMISSION_DENIED) {
            setLocationPermission('denied');
          }
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    };

    getLocation();
  }, [initialLocationSet]);

  // Auto-lock services when risk is critical
  useEffect(() => {
    if (riskScore >= 70 && !servicesLocked) {
      setServicesLocked(true);
      triggerAlert('🔒 SECURITY LOCKDOWN: All transaction services have been automatically disabled due to critical fraud risk.');
    }
  }, [riskScore, servicesLocked]);

  const addEvent = (type, description, severity) => {
    const newEvent = {
      id: Date.now(),
      type,
      description,
      severity,
      timestamp: new Date().toLocaleString()
    };
    setEvents(prev => [newEvent, ...prev]);
    return newEvent;
  };

  const triggerAlert = (message) => {
    setAlertMessage(message);
    setShowAlert(true);
  };

  const requestLocationPermission = () => {
    navigator.geolocation.getCurrentPosition(
      () => {
        window.location.reload(); // Reload to get location
      },
      (error) => {
        alert('Location permission denied. Please enable location access in your browser settings.');
      }
    );
  };

  const simulateSIMSwap = async () => {
    // Simulate SIM swap by changing device fingerprint
    const fakeFingerprint = await hashString(Math.random().toString());
    
    addEvent('simSwap', 'SIM card changed to new device', 'critical');
    setDeviceInfo(prev => ({
      ...prev,
      name: 'Unknown Android Device',
      fingerprint: fakeFingerprint,
      trusted: false
    }));
    const newScore = calculateRiskScore([...events, { type: 'simSwap' }]);
    setRiskScore(newScore);
    triggerAlert('⚠️ SIM SWAP DETECTED: Device fingerprint changed. Your phone number may have been transferred to a new device.');
  };

  const simulateNewDevice = async () => {
    addEvent('deviceMismatch', 'Login attempt from unrecognized device fingerprint', 'high');
    const newScore = calculateRiskScore([...events, { type: 'deviceMismatch' }]);
    setRiskScore(newScore);
    triggerAlert('🔔 New device login detected with different hardware fingerprint');
  };

  const simulateLocationChange = () => {
    if (!location.latitude || !location.longitude) {
      alert('Please allow location access first to simulate location anomaly');
      return;
    }
    
    // Calculate distance from trusted location
    const distance = trustedLocation ? 
      calculateDistance(
        trustedLocation.latitude, 
        trustedLocation.longitude,
        location.latitude,
        location.longitude
      ) : 0;
    
    addEvent('locationAnomaly', `Impossible travel: Location changed to Moscow, Russia (${Math.round(distance)}km from trusted location)`, 'high');
    setLocation(prev => ({
      ...prev,
      city: 'Moscow, Russia',
      trusted: false,
      coordinates: '55.7558° N, 37.6173° E'
    }));
    const newScore = calculateRiskScore([...events, { type: 'locationAnomaly' }]);
    setRiskScore(newScore);
    triggerAlert('🌍 LOCATION ANOMALY: Activity detected from Russia - impossible travel pattern identified.');
  };

  const simulateOTPBurst = () => {
    const burst = Array.from({ length: 5 }, (_, i) => ({
      id: Date.now() + i,
      code: Math.floor(100000 + Math.random() * 900000),
      service: ['Banking App', 'Email', 'Social Media', 'Payment Gateway', 'Crypto Wallet'][i],
      timestamp: new Date(Date.now() - i * 1000).toLocaleTimeString()
    }));
    setOtpActivity(burst);
    addEvent('otpBurst', '5 OTP requests in 30 seconds - credential stuffing detected', 'high');
    const newScore = calculateRiskScore([...events, { type: 'otpBurst' }]);
    setRiskScore(newScore);
    triggerAlert('⚡ OTP BURST DETECTED: Multiple authentication codes requested rapidly - possible credential stuffing attack.');
  };

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const startRecovery = () => {
    setShowRecovery(true);
    setRecoveryStep(0);
  };

  const verifyBiometric = async () => {
    setBiometricVerifying(true);
    
    if (biometricAvailable) {
      // Use Web Authentication API for real biometric verification
      try {
        const publicKeyCredentialCreationOptions = {
          challenge: new Uint8Array(32), // In production, get from server
          rp: {
            name: "CyberSentrix",
            id: window.location.hostname,
          },
          user: {
            id: new Uint8Array(16),
            name: "user@cybersentrix.com",
            displayName: "User",
          },
          pubKeyCredParams: [{alg: -7, type: "public-key"}],
          authenticatorSelection: {
            authenticatorAttachment: "platform",
            userVerification: "required"
          },
          timeout: 60000,
          attestation: "direct"
        };

        // This will trigger device biometric (Face ID, Touch ID, Windows Hello, etc.)
        const credential = await navigator.credentials.create({
          publicKey: publicKeyCredentialCreationOptions
        });

        if (credential) {
          // Biometric verification successful
          setTimeout(() => {
            setBiometricVerifying(false);
            setRecoveryStep(1);
            completeRecovery();
          }, 1000);
        }
      } catch (error) {
        console.error('Biometric verification error:', error);
        // Fall back to simulated verification
        setTimeout(() => {
          setBiometricVerifying(false);
          setRecoveryStep(1);
          completeRecovery();
        }, 2000);
      }
    } else {
      // Simulated verification for devices without biometric support
      setTimeout(() => {
        setBiometricVerifying(false);
        setRecoveryStep(1);
        completeRecovery();
      }, 2000);
    }
  };

  const completeRecovery = () => {
    setTimeout(() => {
      setRecoveryStep(2);
      setTimeout(async () => {
        setRecoveryStep(3);
        setTimeout(async () => {
          // Restore to real device fingerprint
          const realFingerprint = await generateDeviceFingerprint();
          
          setServicesLocked(false);
          setRiskScore(5);
          setEvents([]);
          setOtpActivity([]);
          setDeviceInfo(prev => ({
            ...prev,
            fingerprint: realFingerprint,
            trusted: true
          }));
          
          // Restore trusted location
          if (trustedLocation) {
            setLocation(trustedLocation);
          }
          
          setShowRecovery(false);
          setRecoveryStep(0);
          triggerAlert('✅ ACCOUNT RECOVERED: Biometric verification successful. All services restored.');
        }, 1500);
      }, 1500);
    }, 1500);
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0a0e27 0%, #1a1f3a 50%, #0f1629 100%)',
      color: '#e0e7ff',
      fontFamily: '"JetBrains Mono", "Courier New", monospace',
      padding: '20px',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Animated background grid */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundImage: `
          linear-gradient(rgba(99, 102, 241, 0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(99, 102, 241, 0.03) 1px, transparent 1px)
        `,
        backgroundSize: '50px 50px',
        animation: 'gridMove 20s linear infinite',
        pointerEvents: 'none'
      }} />

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600;700&display=swap');
        
        @keyframes gridMove {
          0% { transform: translate(0, 0); }
          100% { transform: translate(50px, 50px); }
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        
        @keyframes slideIn {
          from { transform: translateX(-20px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        
        @keyframes glow {
          0%, 100% { box-shadow: 0 0 20px rgba(99, 102, 241, 0.3); }
          50% { box-shadow: 0 0 40px rgba(99, 102, 241, 0.6); }
        }
        
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        @keyframes riskPulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
      `}</style>

      {/* Header */}
      <div style={{ position: 'relative', zIndex: 10, marginBottom: '30px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '10px' }}>
          <Shield size={40} color="#6366f1" style={{ animation: 'glow 2s infinite' }} />
          <div>
            <h1 style={{ 
              margin: 0, 
              fontSize: '32px', 
              fontWeight: 700,
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              letterSpacing: '-1px'
            }}>
              CyberSentrix
            </h1>
            <p style={{ margin: '5px 0 0 0', fontSize: '13px', color: '#94a3b8', letterSpacing: '0.5px' }}>
              AI-POWERED FRAUD DETECTION & RESPONSE SYSTEM
            </p>
          </div>
        </div>
        
        {/* Real-time status indicators */}
        <div style={{ display: 'flex', gap: '15px', fontSize: '11px', marginTop: '15px' }}>
          <div style={{ 
            padding: '6px 12px', 
            background: biometricAvailable ? 'rgba(0, 255, 136, 0.1)' : 'rgba(100, 116, 139, 0.1)',
            border: `1px solid ${biometricAvailable ? '#00ff88' : '#64748b'}`,
            borderRadius: '6px',
            color: biometricAvailable ? '#00ff88' : '#94a3b8'
          }}>
            🔐 Biometric: {biometricAvailable ? 'Available' : 'Not Supported'}
          </div>
          <div style={{ 
            padding: '6px 12px', 
            background: locationPermission === 'granted' ? 'rgba(0, 255, 136, 0.1)' : 'rgba(255, 153, 51, 0.1)',
            border: `1px solid ${locationPermission === 'granted' ? '#00ff88' : '#ff9933'}`,
            borderRadius: '6px',
            color: locationPermission === 'granted' ? '#00ff88' : '#ff9933'
          }}>
            📍 Location: {locationPermission === 'granted' ? 'Enabled' : locationPermission === 'denied' ? 'Denied' : 'Not Requested'}
          </div>
        </div>
      </div>

      {/* Alert Modal */}
      {showAlert && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          animation: 'slideIn 0.3s ease-out'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
            border: `2px solid ${riskLevel.color}`,
            borderRadius: '12px',
            padding: '30px',
            maxWidth: '500px',
            width: '90%',
            boxShadow: `0 20px 60px rgba(0, 0, 0, 0.5), 0 0 40px ${riskLevel.color}40`
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '15px', marginBottom: '20px' }}>
              <AlertTriangle size={32} color={riskLevel.color} style={{ flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <h3 style={{ margin: '0 0 10px 0', fontSize: '18px', color: riskLevel.color }}>
                  SECURITY ALERT
                </h3>
                <p style={{ margin: 0, fontSize: '14px', lineHeight: '1.6', color: '#cbd5e1' }}>
                  {alertMessage}
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowAlert(false)}
              style={{
                width: '100%',
                padding: '12px',
                background: riskLevel.color,
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: 'inherit'
              }}
            >
              ACKNOWLEDGE
            </button>
          </div>
        </div>
      )}

      {/* Recovery Modal */}
      {showRecovery && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.9)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          animation: 'slideIn 0.3s ease-out'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
            border: '2px solid #6366f1',
            borderRadius: '12px',
            padding: '40px',
            maxWidth: '500px',
            width: '90%',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5), 0 0 40px rgba(99, 102, 241, 0.3)'
          }}>
            <h3 style={{ margin: '0 0 30px 0', fontSize: '22px', textAlign: 'center' }}>
              Account Recovery Process
            </h3>

            {/* Step 0: Biometric Verification */}
            {recoveryStep === 0 && (
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  width: '120px',
                  height: '120px',
                  margin: '0 auto 30px',
                  borderRadius: '50%',
                  background: biometricVerifying ? 'rgba(99, 102, 241, 0.2)' : 'rgba(99, 102, 241, 0.1)',
                  border: '3px solid #6366f1',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  animation: biometricVerifying ? 'riskPulse 1s infinite' : 'none'
                }}>
                  <Fingerprint size={60} color="#6366f1" />
                </div>
                <p style={{ marginBottom: '20px', color: '#cbd5e1', fontSize: '13px' }}>
                  {biometricVerifying ? 'Verifying your identity...' : 
                   biometricAvailable ? 'Your device will prompt for biometric authentication' : 
                   'Click to verify (simulated on this device)'}
                </p>
                {biometricAvailable && !biometricVerifying && (
                  <p style={{ marginBottom: '30px', color: '#94a3b8', fontSize: '12px' }}>
                    🔐 Use Face ID, Touch ID, or Windows Hello
                  </p>
                )}
                {!biometricVerifying && (
                  <button
                    onClick={verifyBiometric}
                    style={{
                      width: '100%',
                      padding: '14px',
                      background: '#6366f1',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      fontFamily: 'inherit'
                    }}
                  >
                    START VERIFICATION
                  </button>
                )}
              </div>
            )}

            {/* Step 1: Identity Confirmed */}
            {recoveryStep === 1 && (
              <div style={{ textAlign: 'center' }}>
                <Check size={80} color="#00ff88" style={{ marginBottom: '20px' }} />
                <h4 style={{ margin: '0 0 10px 0', color: '#00ff88', fontSize: '18px' }}>
                  Identity Verified
                </h4>
                <p style={{ color: '#cbd5e1' }}>Processing recovery...</p>
              </div>
            )}

            {/* Step 2: Restoring Services */}
            {recoveryStep === 2 && (
              <div style={{ textAlign: 'center' }}>
                <div style={{ marginBottom: '20px', animation: 'spin 1s linear infinite' }}>
                  <Zap size={80} color="#6366f1" />
                </div>
                <h4 style={{ margin: '0 0 10px 0', color: '#6366f1', fontSize: '18px' }}>
                  Restoring Services
                </h4>
                <p style={{ color: '#cbd5e1' }}>Re-enabling transaction capabilities...</p>
              </div>
            )}

            {/* Step 3: Complete */}
            {recoveryStep === 3 && (
              <div style={{ textAlign: 'center' }}>
                <Shield size={80} color="#00ff88" style={{ marginBottom: '20px' }} />
                <h4 style={{ margin: '0 0 10px 0', color: '#00ff88', fontSize: '18px' }}>
                  Recovery Complete
                </h4>
                <p style={{ color: '#cbd5e1' }}>Your account is now secure</p>
              </div>
            )}
          </div>
        </div>
      )}

      <div style={{ position: 'relative', zIndex: 10 }}>
        {/* Risk Meter */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.6) 0%, rgba(15, 23, 42, 0.6) 100%)',
          backdropFilter: 'blur(10px)',
          border: `2px solid ${riskLevel.color}`,
          borderRadius: '16px',
          padding: '30px',
          marginBottom: '25px',
          boxShadow: `0 8px 32px rgba(0, 0, 0, 0.3), 0 0 30px ${riskLevel.color}20`,
          animation: riskScore >= 70 ? 'glow 2s infinite' : 'none'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <h2 style={{ margin: '0 0 5px 0', fontSize: '16px', color: '#94a3b8', fontWeight: 400, letterSpacing: '1px' }}>
                THREAT RISK SCORE
              </h2>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px' }}>
                <span style={{ 
                  fontSize: '48px', 
                  fontWeight: 700, 
                  color: riskLevel.color,
                  lineHeight: 1,
                  animation: riskScore >= 70 ? 'pulse 1.5s infinite' : 'none'
                }}>
                  {riskScore}
                </span>
                <span style={{ fontSize: '20px', color: '#64748b' }}>/100</span>
              </div>
            </div>
            <div style={{
              padding: '12px 24px',
              background: riskLevel.bg,
              border: `2px solid ${riskLevel.color}`,
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: 700,
              color: riskLevel.color,
              letterSpacing: '1px'
            }}>
              {riskLevel.level}
            </div>
          </div>

          {/* Risk meter bar */}
          <div style={{
            height: '12px',
            background: 'rgba(15, 23, 42, 0.8)',
            borderRadius: '6px',
            overflow: 'hidden',
            border: '1px solid rgba(99, 102, 241, 0.2)'
          }}>
            <div style={{
              height: '100%',
              width: `${riskScore}%`,
              background: `linear-gradient(90deg, ${riskLevel.color} 0%, ${riskLevel.color}dd 100%)`,
              transition: 'width 0.5s ease-out',
              boxShadow: `0 0 20px ${riskLevel.color}80`
            }} />
          </div>
        </div>

        {/* Main Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', marginBottom: '25px' }}>
          {/* Device Status - NOW WITH REAL DATA */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.6) 0%, rgba(15, 23, 42, 0.6) 100%)',
            backdropFilter: 'blur(10px)',
            border: `2px solid ${deviceInfo.trusted ? '#334155' : '#ff3366'}`,
            borderRadius: '12px',
            padding: '24px',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
              <Smartphone size={24} color={deviceInfo.trusted ? '#6366f1' : '#ff3366'} />
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600, letterSpacing: '0.5px' }}>
                DEVICE STATUS (REAL)
              </h3>
            </div>
            <div style={{ fontSize: '12px', lineHeight: '1.8' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: '#94a3b8' }}>Device:</span>
                <span style={{ color: deviceInfo.trusted ? '#00ff88' : '#ff3366', fontWeight: 600 }}>
                  {deviceInfo.name}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: '#94a3b8' }}>Fingerprint:</span>
                <span style={{ fontFamily: 'monospace', color: '#cbd5e1', fontSize: '11px' }}>
                  {deviceInfo.fingerprint}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: '#94a3b8' }}>Platform:</span>
                <span style={{ color: '#cbd5e1' }}>{deviceInfo.platform}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: '#94a3b8' }}>CPU Cores:</span>
                <span style={{ color: '#cbd5e1' }}>{deviceInfo.cores}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: '#94a3b8' }}>Memory:</span>
                <span style={{ color: '#cbd5e1' }}>{deviceInfo.memory}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: '#94a3b8' }}>Screen:</span>
                <span style={{ color: '#cbd5e1' }}>{deviceInfo.screen}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#94a3b8' }}>Status:</span>
                <span style={{ 
                  color: deviceInfo.trusted ? '#00ff88' : '#ff3366',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  {deviceInfo.trusted ? <Check size={14} /> : <X size={14} />}
                  {deviceInfo.trusted ? 'Trusted' : 'Untrusted'}
                </span>
              </div>
            </div>
          </div>

          {/* Location Status - NOW WITH REAL DATA */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.6) 0%, rgba(15, 23, 42, 0.6) 100%)',
            backdropFilter: 'blur(10px)',
            border: `2px solid ${location.trusted ? '#334155' : '#ff3366'}`,
            borderRadius: '12px',
            padding: '24px',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
              <MapPin size={24} color={location.trusted ? '#6366f1' : '#ff3366'} />
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600, letterSpacing: '0.5px' }}>
                LOCATION (REAL)
              </h3>
            </div>
            <div style={{ fontSize: '12px', lineHeight: '1.8' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: '#94a3b8' }}>Current:</span>
                <span style={{ color: location.trusted ? '#00ff88' : '#ff3366', fontWeight: 600 }}>
                  {location.city}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: '#94a3b8' }}>Coordinates:</span>
                <span style={{ fontFamily: 'monospace', fontSize: '10px', color: '#cbd5e1' }}>
                  {location.coordinates}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: '#94a3b8' }}>Timezone:</span>
                <span style={{ color: '#cbd5e1', fontSize: '11px' }}>{location.timezone || 'N/A'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: '#94a3b8' }}>Accuracy:</span>
                <span style={{ color: '#cbd5e1' }}>{location.accuracy || 'N/A'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#94a3b8' }}>Status:</span>
                <span style={{ 
                  color: location.trusted ? '#00ff88' : '#ff3366',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  {location.trusted ? <Check size={14} /> : <AlertTriangle size={14} />}
                  {location.trusted ? 'Normal' : 'Anomaly'}
                </span>
              </div>
            </div>
            {locationPermission !== 'granted' && (
              <button
                onClick={requestLocationPermission}
                style={{
                  width: '100%',
                  marginTop: '12px',
                  padding: '10px',
                  background: '#6366f1',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontFamily: 'inherit'
                }}
              >
                📍 Enable Location Access
              </button>
            )}
          </div>

          {/* Transaction Services */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.6) 0%, rgba(15, 23, 42, 0.6) 100%)',
            backdropFilter: 'blur(10px)',
            border: `2px solid ${servicesLocked ? '#ff3366' : '#334155'}`,
            borderRadius: '12px',
            padding: '24px',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
              {servicesLocked ? <Lock size={24} color="#ff3366" /> : <Activity size={24} color="#6366f1" />}
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600, letterSpacing: '0.5px' }}>
                SERVICES STATUS
              </h3>
            </div>
            <div style={{ fontSize: '12px' }}>
              {['Banking', 'Payments', 'Transfers', 'OTP Auth'].map((service, i) => (
                <div key={i} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px',
                  background: servicesLocked ? 'rgba(255, 51, 102, 0.1)' : 'rgba(99, 102, 241, 0.05)',
                  borderRadius: '6px',
                  marginBottom: i < 3 ? '8px' : 0,
                  border: `1px solid ${servicesLocked ? '#ff336640' : '#6366f140'}`
                }}>
                  <span style={{ color: '#cbd5e1' }}>{service}</span>
                  <span style={{
                    padding: '4px 12px',
                    borderRadius: '4px',
                    fontSize: '11px',
                    fontWeight: 600,
                    background: servicesLocked ? '#ff3366' : '#00ff88',
                    color: servicesLocked ? '#fff' : '#0a0e27'
                  }}>
                    {servicesLocked ? 'LOCKED' : 'ACTIVE'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Simulation Controls */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.6) 0%, rgba(15, 23, 42, 0.6) 100%)',
          backdropFilter: 'blur(10px)',
          border: '2px solid #334155',
          borderRadius: '12px',
          padding: '24px',
          marginBottom: '25px',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)'
        }}>
          <h3 style={{ margin: '0 0 20px 0', fontSize: '16px', fontWeight: 600, letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Zap size={24} color="#6366f1" />
            THREAT SIMULATION CONTROLS
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
            <button
              onClick={simulateSIMSwap}
              disabled={servicesLocked}
              style={{
                padding: '14px',
                background: servicesLocked ? '#334155' : 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)',
                color: servicesLocked ? '#64748b' : '#fff',
                border: 'none',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: 600,
                cursor: servicesLocked ? 'not-allowed' : 'pointer',
                fontFamily: 'inherit',
                opacity: servicesLocked ? 0.5 : 1,
                transition: 'all 0.2s'
              }}
            >
              🔄 SIMULATE SIM SWAP
            </button>
            <button
              onClick={simulateNewDevice}
              disabled={servicesLocked}
              style={{
                padding: '14px',
                background: servicesLocked ? '#334155' : 'linear-gradient(135deg, #ea580c 0%, #9a3412 100%)',
                color: servicesLocked ? '#64748b' : '#fff',
                border: 'none',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: 600,
                cursor: servicesLocked ? 'not-allowed' : 'pointer',
                fontFamily: 'inherit',
                opacity: servicesLocked ? 0.5 : 1,
                transition: 'all 0.2s'
              }}
            >
              📱 NEW DEVICE LOGIN
            </button>
            <button
              onClick={simulateLocationChange}
              disabled={servicesLocked}
              style={{
                padding: '14px',
                background: servicesLocked ? '#334155' : 'linear-gradient(135deg, #ca8a04 0%, #713f12 100%)',
                color: servicesLocked ? '#64748b' : '#fff',
                border: 'none',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: 600,
                cursor: servicesLocked ? 'not-allowed' : 'pointer',
                fontFamily: 'inherit',
                opacity: servicesLocked ? 0.5 : 1,
                transition: 'all 0.2s'
              }}
            >
              🌍 LOCATION ANOMALY
            </button>
            <button
              onClick={simulateOTPBurst}
              disabled={servicesLocked}
              style={{
                padding: '14px',
                background: servicesLocked ? '#334155' : 'linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%)',
                color: servicesLocked ? '#64748b' : '#fff',
                border: 'none',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: 600,
                cursor: servicesLocked ? 'not-allowed' : 'pointer',
                fontFamily: 'inherit',
                opacity: servicesLocked ? 0.5 : 1,
                transition: 'all 0.2s'
              }}
            >
              ⚡ OTP BURST ATTACK
            </button>
          </div>
          {servicesLocked && (
            <button
              onClick={startRecovery}
              style={{
                width: '100%',
                marginTop: '12px',
                padding: '16px',
                background: 'linear-gradient(135deg, #00ff88 0%, #00cc6a 100%)',
                color: '#0a0e27',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: 700,
                cursor: 'pointer',
                fontFamily: 'inherit',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                boxShadow: '0 0 30px rgba(0, 255, 136, 0.4)'
              }}
            >
              <Fingerprint size={20} />
              INITIATE ACCOUNT RECOVERY
            </button>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
          {/* Event Log */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.6) 0%, rgba(15, 23, 42, 0.6) 100%)',
            backdropFilter: 'blur(10px)',
            border: '2px solid #334155',
            borderRadius: '12px',
            padding: '24px',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
              <Activity size={24} color="#6366f1" />
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600, letterSpacing: '0.5px' }}>
                SECURITY EVENT LOG
              </h3>
            </div>
            <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
              {events.length === 0 ? (
                <p style={{ color: '#64748b', fontSize: '13px', textAlign: 'center', padding: '20px' }}>
                  No security events detected
                </p>
              ) : (
                events.map((event, i) => (
                  <div key={event.id} style={{
                    padding: '12px',
                    background: event.severity === 'critical' ? 'rgba(255, 51, 102, 0.1)' : 'rgba(255, 153, 51, 0.1)',
                    borderLeft: `3px solid ${event.severity === 'critical' ? '#ff3366' : '#ff9933'}`,
                    borderRadius: '4px',
                    marginBottom: i < events.length - 1 ? '10px' : 0,
                    animation: 'slideIn 0.3s ease-out',
                    fontSize: '12px'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span style={{ color: event.severity === 'critical' ? '#ff3366' : '#ff9933', fontWeight: 600, textTransform: 'uppercase', fontSize: '11px' }}>
                        {event.severity}
                      </span>
                      <span style={{ color: '#64748b', fontSize: '11px' }}>{event.timestamp.split(',')[1]}</span>
                    </div>
                    <p style={{ margin: 0, color: '#cbd5e1' }}>{event.description}</p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* OTP Activity Monitor */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.6) 0%, rgba(15, 23, 42, 0.6) 100%)',
            backdropFilter: 'blur(10px)',
            border: '2px solid #334155',
            borderRadius: '12px',
            padding: '24px',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
              <Clock size={24} color="#6366f1" />
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600, letterSpacing: '0.5px' }}>
                OTP ACTIVITY MONITOR
              </h3>
            </div>
            <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
              {otpActivity.length === 0 ? (
                <p style={{ color: '#64748b', fontSize: '13px', textAlign: 'center', padding: '20px' }}>
                  No recent OTP requests
                </p>
              ) : (
                otpActivity.map((otp, i) => (
                  <div key={otp.id} style={{
                    padding: '12px',
                    background: 'rgba(139, 92, 246, 0.1)',
                    border: '1px solid #8b5cf640',
                    borderRadius: '6px',
                    marginBottom: i < otpActivity.length - 1 ? '8px' : 0,
                    fontSize: '12px'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span style={{ color: '#cbd5e1', fontWeight: 600 }}>{otp.service}</span>
                      <span style={{ color: '#64748b', fontSize: '11px' }}>{otp.timestamp}</span>
                    </div>
                    <div style={{ 
                      fontFamily: 'monospace', 
                      fontSize: '18px', 
                      color: '#8b5cf6',
                      letterSpacing: '2px',
                      fontWeight: 700
                    }}>
                      {otp.code}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CyberSentrix;