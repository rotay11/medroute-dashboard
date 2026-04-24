import React from 'react'

const APK_URL = 'https://expo.dev/artifacts/eas/tzXJ9CTwDcWGwX1uTq91F2.apk'
const IOS_URL = 'https://testflight.apple.com/join/h34Kc8M6'

export default function DownloadPage() {
  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.logo}>
          <div style={styles.logoIcon}>M</div>
          <div>
            <div style={styles.logoTitle}>MedRouteRx Driver</div>
            <div style={styles.logoSub}>Clayworth Pharmacy</div>
          </div>
        </div>
        <div style={styles.version}>Version 1.0.0</div>
        <div style={styles.section}>
          <div style={styles.platformCard}>
            <div style={{width:36,height:36,borderRadius:8,background:'#E1F5EE',display:'flex',alignItems:'center',justifyContent:'center',fontSize:16,fontWeight:'bold',color:'#1D9E75',flexShrink:0}}>A</div>
            <div style={styles.platformInfo}>
              <div style={styles.platformName}>Android</div>
              <div style={styles.platformSub}>For Android phones and tablets</div>
            </div>
            <a href={APK_URL} style={styles.downloadBtn}>Download APK</a>
          </div>
        </div>
        <div style={styles.instructions}>
          <div style={styles.instructionsTitle}>Installation instructions</div>
          <div style={styles.step}><span style={styles.stepNum}>1</span><span>Tap Download APK above</span></div>
          <div style={styles.step}><span style={styles.stepNum}>2</span><span>Open your Downloads folder and tap the file</span></div>
          <div style={styles.step}><span style={styles.stepNum}>3</span><span>If prompted allow installation from unknown sources</span></div>
          <div style={styles.step}><span style={styles.stepNum}>4</span><span>Open MedRouteRx Driver and sign in with your credentials</span></div>
        </div>
        <div style={styles.platformCard}>
          <div style={{width:36,height:36,borderRadius:8,background:'#E8E8ED',display:'flex',alignItems:'center',justifyContent:'center',fontSize:16,fontWeight:'bold',color:'#333',flexShrink:0}}>i</div>
          <div style={styles.platformInfo}>
            <div style={styles.platformName}>iPhone (iOS)</div>
            <div style={styles.platformSub}>Open in Safari and add to home screen</div>
          </div>
          <a href={IOS_URL} style={{...styles.downloadBtn,background:'#333'}}>Join TestFlight Beta</a>
          <div style={styles.step}><span style={styles.stepNum}>1</span><span>Install TestFlight from the App Store (free)</span></div>
          <div style={styles.step}><span style={styles.stepNum}>2</span><span>Tap Join TestFlight Beta above</span></div>
          <div style={styles.step}><span style={styles.stepNum}>3</span><span>Open TestFlight and install MedRouteRx Driver</span></div>
          <div style={styles.step}><span style={styles.stepNum}>4</span><span>Sign in with your credentials</span></div>
        </div>

        <div style={styles.support}>Need help? Contact your dispatcher or administrator.
        </div>
        <div style={{background:'#fff',borderRadius:12,padding:24,textAlign:'center',marginTop:16,border:'1px solid #e0e0e0'}}>
          <div style={{fontSize:14,fontWeight:600,color:'#333',marginBottom:8}}>Scan to download</div>
          <div style={{fontSize:12,color:'#888',marginBottom:16}}>Point your phone camera at this QR code</div>
          <img src={'https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=' + encodeURIComponent('https://medroute-dashboard.vercel.app/download')} alt="QR Code" style={{width:180,height:180,borderRadius:8}} />
          <div style={{fontSize:11,color:'#aaa',marginTop:8}}>medroute-dashboard.vercel.app/download</div>
        </div>
      </div>
    </div>
  )
}

const styles = {
  page:             {minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'#f0f4f8',padding:20},
  card:             {background:'#fff',borderRadius:12,padding:32,width:'100%',maxWidth:400,boxShadow:'0 2px 20px rgba(0,0,0,0.08)'},
  logo:             {display:'flex',alignItems:'center',gap:12,marginBottom:20},
  logoIcon:         {width:48,height:48,background:'#1D9E75',borderRadius:12,display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontSize:24,fontWeight:'bold'},
  logoTitle:        {fontSize:18,fontWeight:600,color:'#333'},
  logoSub:          {fontSize:12,color:'#888'},
  version:          {fontSize:11,color:'#aaa',marginBottom:20},
  section:          {marginBottom:24},
  platformCard:     {display:'flex',alignItems:'center',gap:12,padding:14,border:'1px solid #e0e0e0',borderRadius:10},
  platformInfo:     {flex:1},
  platformName:     {fontSize:13,fontWeight:600,color:'#333'},
  platformSub:      {fontSize:11,color:'#888'},
  downloadBtn:      {padding:'8px 14px',background:'#1D9E75',color:'#fff',borderRadius:8,fontSize:12,fontWeight:600,textDecoration:'none',whiteSpace:'nowrap'},
  instructions:     {background:'#f9f9f9',borderRadius:8,padding:16,marginBottom:16},
  instructionsTitle:{fontSize:11,fontWeight:600,color:'#666',textTransform:'uppercase',letterSpacing:'0.05em',marginBottom:10},
  step:             {display:'flex',alignItems:'flex-start',gap:10,marginBottom:8,fontSize:13,color:'#555'},
  stepNum:          {width:20,height:20,borderRadius:'50%',background:'#1D9E75',color:'#fff',fontSize:11,fontWeight:600,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0},
  support:          {fontSize:12,color:'#aaa',textAlign:'center'},
  divider:          {height:1,background:'#f0f0f0',margin:'20px 0'},
  portalSection:    {textAlign:'center',marginBottom:16},
  portalTitle:      {fontSize:14,fontWeight:600,color:'#333',marginBottom:4},
  portalSub:        {fontSize:12,color:'#888',marginBottom:12},
  portalBtn:        {display:'inline-block',padding:'10px 20px',background:'#f0f4f8',color:'#333',borderRadius:8,fontSize:13,fontWeight:600,textDecoration:'none',border:'1px solid #e0e0e0'},
}
