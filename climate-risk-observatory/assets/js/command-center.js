(function(){
  'use strict';
  const $=id=>document.getElementById(id);
  const modelVersion='CC-1.0';
  const profiles={
    hkh:{title:'Mountain watershed · rainfall and slope risk',hazard:75,exposure:60,vulnerability:65,warning:15,lifeline:20,buffer:15,recovery:20,note:'Hypothetical setting: steep catchments, exposed transport routes and water services. Values are workshop assumptions, not measurements for a named valley.'},
    urban:{title:'Dense urban area · flood, heat and lifelines',hazard:68,exposure:88,vulnerability:66,warning:22,lifeline:25,buffer:12,recovery:25,note:'Hypothetical setting: concentrated people and assets, drainage, power, transport and healthcare dependencies. This is not a city-specific risk estimate.'},
    food:{title:'Food supply network · abrupt production shock',hazard:85,exposure:78,vulnerability:72,warning:10,lifeline:22,buffer:32,recovery:25,note:'Hypothetical setting: crop production, storage, fuel, transport and food distribution. This is not a famine or food-availability forecast.'},
    monsoon:{title:'Monsoon river basin · flood and seasonal water',hazard:72,exposure:75,vulnerability:62,warning:20,lifeline:25,buffer:20,recovery:20,note:'Hypothetical setting: upstream rainfall and river flows, floodplain settlements, agriculture and downstream services. Not a forecast for a named basin.'}
  };
  const keys=['hazard','exposure','vulnerability','warning','lifeline','buffer','recovery'];
  const controls={profile:$('ccProfile'),hazard:$('ccHazard'),exposure:$('ccExposure'),vulnerability:$('ccVulnerability'),warning:$('ccWarning'),lifeline:$('ccLifeline'),buffer:$('ccBuffer'),recovery:$('ccRecovery')};
  const labels={hazard:'Hazard stress',exposure:'Exposure',vulnerability:'Vulnerability'};
  const nodes={
    hazard:{code:'NODE / 01',title:'Hazard pressure',description:'Define the physical process and scenario boundary before assigning a number. For rainfall risk this could include intensity, duration, catchment response and slope conditions.',evidence:'Official meteorological records, hydrological observations, terrain and documented scenario assumptions.'},
    exposure:{code:'NODE / 02',title:'People and assets exposed',description:'Exposure is the population, assets, services or ecosystems in places that could be affected. Land-use choices and the location of critical services can change exposure even when hazard pressure is unchanged.',evidence:'Population and asset inventories, land-use maps, transport routes, service locations and disaggregated exposure data.'},
    lifelines:{code:'NODE / 03',title:'Critical lifelines',description:'Power, roads, communications, drainage and water systems can fail together or depend on one another. A single bridge, substation or treatment plant may become a bottleneck in a cascading disruption.',evidence:'Infrastructure network maps, dependency registers, redundancy, outage records, maintenance plans and alternate-route assessments.'},
    services:{code:'NODE / 04',title:'Essential services',description:'Household outcomes depend on whether food, healthcare, shelter, sanitation and warnings remain accessible, not just whether a physical asset survives. Unequal access can amplify harm.',evidence:'Healthcare capacity, food access and market data, shelter capacity, accessibility audits and service continuity plans.'},
    recovery:{code:'NODE / 05',title:'Recovery capacity',description:'Recovery depends on resources, governance, trusted communication, financing, repair capacity and equitable access to support. It shapes how long disruption persists and who bears the burden.',evidence:'Recovery plans, emergency budgets, supply contracts, social protection coverage and after-action reviews.'}
  };
  const nodeOrder=['hazard','exposure','lifelines','services','recovery'];
  const round1=n=>Math.round(n*10)/10;
  const clamp=(n,lo,hi)=>Math.max(lo,Math.min(hi,n));
  const value=key=>Number(controls[key].value);
  function readInputs(){return {profile:controls.profile.value,hazard:value('hazard'),exposure:value('exposure'),vulnerability:value('vulnerability'),assumedReductions:{earlyWarning:value('warning'),criticalLifelineContinuity:value('lifeline'),foodWaterBuffers:value('buffer'),preparednessRecovery:value('recovery')}};}
  function baseline(v){return v.hazard*(.25+.75*v.exposure/100)*(.25+.75*v.vulnerability/100);}
  function calculate(){
    const v=readInputs(),base=baseline(v);
    const a=v.assumedReductions;
    const multiplier=(1-a.earlyWarning/100)*(1-a.criticalLifelineContinuity/100)*(1-a.foodWaterBuffers/100)*(1-a.preparednessRecovery/100);
    const stressed=baseline({hazard:clamp(v.hazard+15,0,100),exposure:clamp(v.exposure+10,0,100),vulnerability:v.vulnerability});
    const prepared=base*multiplier;
    const sensitivity=['hazard','exposure','vulnerability'].map(k=>{
      const alt={hazard:v.hazard,exposure:v.exposure,vulnerability:v.vulnerability};
      alt[k]=clamp(alt[k]+10,0,100);
      return {key:k,label:labels[k],delta:Math.abs(baseline(alt)-base)};
    });
    return {v,base,stressed,prepared,deltaPct:base===0?null:((prepared-base)/base)*100,sensitivity,multiplier,stressedInputs:{hazard:clamp(v.hazard+15,0,100),exposure:clamp(v.exposure+10,0,100),vulnerability:v.vulnerability}};
  }
  function pct(n){return round1(n).toFixed(1)+'%';}
  function n1(n){return round1(n).toFixed(1);}
  function updateOutputs(result){
    const {v,base,stressed,prepared,deltaPct,sensitivity}=result;
    $('activeScenarioTitle').textContent=profiles[v.profile].title;
    $('ccProfileNote').textContent=profiles[v.profile].note;
    const outs={hazard:'ccHazardOut',exposure:'ccExposureOut',vulnerability:'ccVulnerabilityOut',warning:'ccWarningOut',lifeline:'ccLifelineOut',buffer:'ccBufferOut',recovery:'ccRecoveryOut'};
    keys.forEach(k=>{$(outs[k]).textContent=k==='hazard'||k==='exposure'||k==='vulnerability'?value(k)+' / 100':value(k)+'%';});
    $('ccBaseline').textContent=n1(base);
    $('ccStress').textContent=n1(stressed);
    $('ccPrepared').textContent=n1(prepared);
    $('ccDelta').textContent=deltaPct===null?'N/A':(deltaPct<0?'−':'+')+Math.abs(round1(deltaPct)).toFixed(1)+'%';
    const b=document.querySelectorAll('.cc-bar-row');
    const values=[base,stressed,prepared];
    const names=['Reference case','Compound pressure','Actions · reference hazard'];
    $('ccBars').setAttribute('aria-label','Reference case index '+n1(base)+', compound pressure index '+n1(stressed)+', and assumed actions index '+n1(prepared)+'. Unit-less educational index, not a forecast.');
    b.forEach((row,i)=>{
      row.querySelector('.cc-bar-meta span').textContent=names[i];
      row.querySelector('.cc-bar-meta b').textContent=n1(values[i]);
      const fill=row.querySelector('.cc-bar-fill');
      fill.style.width=clamp(values[i],0,100)+'%';
      fill.setAttribute('aria-label',names[i]+': index '+n1(values[i]));
    });
    const maxDelta=Math.max(...sensitivity.map(s=>s.delta),.1);
    $('ccSensitivity').querySelectorAll('.cc-sens-row').forEach((row,i)=>{
      const item=sensitivity[i];
      row.querySelector('span').textContent=item.label;
      row.querySelector('i').style.width=(item.delta/maxDelta*100)+'%';
      row.querySelector('b').textContent=n1(item.delta);
    });
    updateBrief(result);
  }
  function serialize(result){
    return {
      title:profiles[result.v.profile].title,
      modelVersion,
      generatedAt:new Date().toISOString(),
      scenarioType:'Illustrative, uncalibrated scenario comparison',
      inputs:result.v,
      assumptions:{
        formula:'baseline = hazard * (0.25 + 0.75 * exposure/100) * (0.25 + 0.75 * vulnerability/100)',
        compoundPressure:'hazard + 15 and exposure + 10, both capped at 100; vulnerability unchanged',
        actionsCase:'reference index * product(1 - user-assumed intervention reduction)',
        coefficients:'Teaching design assumptions only; not calibrated to empirical losses',
        interventionReductionsAreUserDefined:true
      },
      outputs:{
        referenceIndex:round1(result.base),
        compoundPressureIndex:round1(result.stressed),
        assumedActionsIndex:round1(result.prepared),
        assumedIndexChangePercent:result.deltaPct===null?null:round1(result.deltaPct),
        sensitivityForPlus10Points:result.sensitivity.map(s=>({input:s.label,absoluteIndexChange:round1(s.delta)}))
      },
      interpretation:'Unit-less educational index. Not a hazard forecast, event probability, casualty estimate, damage model or measured intervention benefit.'
    };
  }
  function makeMarkdown(result){
    const s=serialize(result);
    return '# Climate Shock Lab — Scenario Decision Brief\n\n'+
      '**Scenario:** '+s.title+'\n\n'+
      '**Model version:** '+modelVersion+'  \n**Generated (local browser clock, ISO):** '+s.generatedAt+'\n\n'+
      '## Inputs\n\n'+
      '| Input | Value |\n|---|---:|\n'+
      '| Hazard stress | '+s.inputs.hazard+' / 100 |\n'+
      '| Exposure | '+s.inputs.exposure+' / 100 |\n'+
      '| Vulnerability | '+s.inputs.vulnerability+' / 100 |\n'+
      '| Early warning reduction assumption | '+s.inputs.assumedReductions.earlyWarning+'% |\n'+
      '| Lifeline continuity reduction assumption | '+s.inputs.assumedReductions.criticalLifelineContinuity+'% |\n'+
      '| Food / water buffer reduction assumption | '+s.inputs.assumedReductions.foodWaterBuffers+'% |\n'+
      '| Preparedness / recovery reduction assumption | '+s.inputs.assumedReductions.preparednessRecovery+'% |\n\n'+
      '## Case comparison\n\n'+
      '| Case | Index |\n|---|---:|\n'+
      '| Reference | '+n1(s.outputs.referenceIndex)+' |\n'+
      '| Compound pressure | '+n1(s.outputs.compoundPressureIndex)+' |\n'+
      '| Reference with assumed actions | '+n1(s.outputs.assumedActionsIndex)+' |\n\n'+
      'Assumed index change versus reference: **'+(s.outputs.assumedIndexChangePercent===null?'not defined at zero baseline':pct(s.outputs.assumedIndexChangePercent))+'**.\n\n'+
      '## Sensitivity: +10 input points\n\n'+s.outputs.sensitivityForPlus10Points.map(x=>'- '+x.input+': absolute index change '+n1(x.absoluteIndexChange)).join('\n')+'\n\n'+
      '## Formula and assumptions\n\n'+s.assumptions.formula+'. The compound-pressure case adds 15 hazard points and 10 exposure points, capped at 100. The actions case multiplies the reference index by each (1 − assumed intervention reduction). All coefficients and intervention reductions are design assumptions; no empirical efficacy is claimed.\n\n'+
      '## Interpretation boundary\n\n'+s.interpretation+' Use local data and validated models before making operational decisions.\n';
  }
  function updateBrief(result){
    $('ccBriefPreview').textContent=makeMarkdown(result);
    $('ccUpdatedAt').textContent='UPDATED · '+new Date().toLocaleTimeString([], {hour:'2-digit',minute:'2-digit',second:'2-digit'});
  }
  function download(name,content,mime){
    const blob=new Blob([content],{type:mime});
    const url=URL.createObjectURL(blob);
    const a=document.createElement('a');
    a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();
    setTimeout(()=>URL.revokeObjectURL(url),1000);
  }
  function csvFor(result){
    const s=serialize(result);
    const rows=[
      ['kind','name','value','unit'],
      ['input','profile',s.inputs.profile,'id'],
      ['input','hazard',s.inputs.hazard,'index points'],
      ['input','exposure',s.inputs.exposure,'index points'],
      ['input','vulnerability',s.inputs.vulnerability,'index points'],
      ['assumption','early warning reduction',s.inputs.assumedReductions.earlyWarning,'%'],
      ['assumption','lifeline continuity reduction',s.inputs.assumedReductions.criticalLifelineContinuity,'%'],
      ['assumption','food water buffer reduction',s.inputs.assumedReductions.foodWaterBuffers,'%'],
      ['assumption','preparedness recovery reduction',s.inputs.assumedReductions.preparednessRecovery,'%'],
      ['output','reference index',s.outputs.referenceIndex,'unit-less index'],
      ['output','compound pressure index',s.outputs.compoundPressureIndex,'unit-less index'],
      ['output','assumed actions index',s.outputs.assumedActionsIndex,'unit-less index'],
      ['output','assumed index change',s.outputs.assumedIndexChangePercent??'N/A','%']
    ];
    return rows.map(row=>row.map(v=>'"'+String(v).replace(/"/g,'""')+'"').join(',')).join('\n')+'\n';
  }
  function resetToProfile(profile){
    controls.profile.value=profile;
    const preset=profiles[profile]||profiles.hkh;
    keys.forEach(k=>controls[k].value=preset[k]);
    render('Profile loaded. Review the assumptions before using the result.');
  }
  function readUrl(){
    const p=new URLSearchParams(location.search);
    const profile=p.get('profile');
    if(!profile||!profiles[profile])return false;
    controls.profile.value=profile;
    keys.forEach(k=>{const param=p.get(k);if(param!==null&&Number.isFinite(Number(param)))controls[k].value=clamp(Number(param),0,k==='hazard'||k==='exposure'||k==='vulnerability'?100:50);});
    return true;
  }
  function shareUrl(){
    const v=readInputs(),url=new URL(location.href);
    url.search='';
    url.searchParams.set('profile',v.profile);
    Object.entries(v).forEach(([k,val])=>{if(k==='profile'||k==='assumedReductions')return;url.searchParams.set(k,String(val));});
    Object.entries(v.assumedReductions).forEach(([k,val])=>url.searchParams.set(({earlyWarning:'warning',criticalLifelineContinuity:'lifeline',foodWaterBuffers:'buffer',preparednessRecovery:'recovery'})[k],String(val)));
    return url.toString();
  }
  function render(message){
    const result=calculate();
    updateOutputs(result);
    if(message)$('ccFeedback').textContent=message;
  }
  function flash(message){$('ccFeedback').textContent=message;}
  controls.profile.addEventListener('change',()=>resetToProfile(controls.profile.value));
  keys.forEach(k=>controls[k].addEventListener('input',()=>render('Updated locally. The output is an uncalibrated index, not a forecast.')));
  $('ccReset').addEventListener('click',()=>resetToProfile(controls.profile.value));
  $('saveScenario').addEventListener('click',()=>{
    try{localStorage.setItem('climateShockCommandCenterV1',JSON.stringify(readInputs()));flash('Saved in this browser on this device only.');}
    catch(e){flash('Local saving is unavailable in this browser. Use JSON export instead.');}
  });
  $('ccLoadSaved').addEventListener('click',()=>{
    try{
      const raw=localStorage.getItem('climateShockCommandCenterV1');
      if(!raw){flash('No saved setup found on this device yet.');return;}
      const saved=JSON.parse(raw);
      if(!saved.profile||!profiles[saved.profile])throw new Error('Invalid saved profile');
      controls.profile.value=saved.profile;
      keys.forEach(k=>{let val=k==='warning'?saved.assumedReductions?.earlyWarning:k==='lifeline'?saved.assumedReductions?.criticalLifelineContinuity:k==='buffer'?saved.assumedReductions?.foodWaterBuffers:k==='recovery'?saved.assumedReductions?.preparednessRecovery:saved[k];if(Number.isFinite(Number(val)))controls[k].value=clamp(Number(val),0,k==='hazard'||k==='exposure'||k==='vulnerability'?100:50);});
      render('Saved setup restored from this device.');
    }catch(e){flash('Could not load the saved setup. You can use a scenario JSON export as a record.');}
  });
  $('shareScenario').addEventListener('click',async()=>{
    const url=shareUrl();
    try{await navigator.clipboard.writeText(url);flash('Shareable scenario URL copied. Anyone opening it gets the same inputs.');}
    catch(e){flash('Clipboard unavailable. Copy this URL from the address bar after opening: '+url);}
  });
  $('ccExportMd').addEventListener('click',()=>download('climate-shock-scenario-brief.md',makeMarkdown(calculate()),'text/markdown;charset=utf-8'));
  $('ccExportJson').addEventListener('click',()=>download('climate-shock-scenario.json',JSON.stringify(serialize(calculate()),null,2),'application/json;charset=utf-8'));
  $('ccExportCsv').addEventListener('click',()=>download('climate-shock-scenario.csv',csvFor(calculate()),'text/csv;charset=utf-8'));
  document.querySelectorAll('[data-node]').forEach(button=>button.addEventListener('click',()=>{
    const key=button.dataset.node,d=nodes[key];if(!d)return;
    document.querySelectorAll('[data-node]').forEach(n=>n.classList.toggle('selected',n===button));
    $('ccNodeCode').textContent=d.code;
    $('ccNodeTitle').textContent=d.title;
    $('ccNodeDescription').textContent=d.description;
    $('ccNodeEvidence').textContent=d.evidence;
  }));
  const fromLink=readUrl();
  render(fromLink?'Loaded scenario values from the URL.':'Ready. Adjust the inputs to compare scenario cases.');
})();