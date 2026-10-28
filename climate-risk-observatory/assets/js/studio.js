(function(){
  'use strict';
  const $=function(id){return document.getElementById(id);};
  const inputs={
    profile:$('profile'),hazard:$('hazardInput'),exposure:$('exposureInput'),vulnerability:$('vulnerabilityInput'),
    warning:$('warningInput'),lifeline:$('lifelineInput'),buffer:$('bufferInput'),preparedness:$('preparednessInput')
  };
  const profiles={
    hkh:{hazard:75,exposure:60,vulnerability:65,warning:15,lifeline:20,buffer:15,preparedness:20,note:'Starting profile: a steep catchment with roads, bridges, settlements and water services exposed to intense rainfall. Values are workshop assumptions, not measurements for a named valley.',recommendations:[['Rainfall-to-action chain','Check whether rainfall thresholds, river observations and slope-failure reports trigger specific action early enough.'],['Critical routes & lifelines','Identify single points of failure on bridges, roads, power and water networks; test accessible evacuation and repair logistics.'],['Catchment and slope evidence','Use authoritative watershed, terrain, land-cover and local geology data before any site-specific claim.']]},
    monsoon:{hazard:72,exposure:75,vulnerability:62,warning:20,lifeline:25,buffer:20,preparedness:20,note:'Starting profile: a monsoon river basin with urban/rural settlements, transport, agriculture and water infrastructure. These values are for exploration, not a forecast for any named basin.',recommendations:[['Basin-scale monitoring','Link rainfall, upstream river levels, reservoir operations and downstream warning responsibilities.'],['Evacuation and public services','Test safe routes, shelters, health capacity and warning reach in low-connectivity communities.'],['Floodplain & drainage decisions','Combine rainfall, catchment hydrology, land use and infrastructure data rather than relying on one rainfall statistic.']]},
    urban:{hazard:68,exposure:88,vulnerability:66,warning:22,lifeline:25,buffer:12,preparedness:25,note:'Starting profile: a dense urban area exposed to intense rainfall or heat, with high asset concentration and dependencies between drainage, power, transport and healthcare. Not a city-specific estimate.',recommendations:[['Drainage and surface flow','Map drainage capacity, impervious surfaces, underpasses, basement exposure and safe access to emergency services.'],['Heat and power continuity','Stress-test cooling access, healthcare, electricity demand and backup systems during simultaneous heat and outage.'],['Equitable warning design','Measure whether alerts are understood and actionable for people with disabilities, informal workers and people without smartphones.']]},
    food:{hazard:85,exposure:78,vulnerability:72,warning:10,lifeline:22,buffer:32,preparedness:25,note:'Starting profile: food production, trade, storage and distribution under abrupt crop and fisheries disruption. The severity inputs are hypothetical; this is not a prediction of famine or food availability.',recommendations:[['Food access, not output alone','Map dependence on key crops, suppliers, storage, fuel, transport and household purchasing power.'],['Contingency supply & nutrition','Stress-test diversified staples, seed/input access, transparent reserves and equitable allocation over multiple years.'],['Evidence for systemic effects','Use the peer-reviewed scenario studies and the NWDC model-data release; do not convert production declines directly into death counts.']]}
  };
  const labels={hkh:'Mountain watershed · intense rainfall / slope risk',monsoon:'South Asian monsoon basin · flood / seasonal water',urban:'Dense urban area · pluvial flood / heat',food:'Global food and trade system · abrupt crop shock'};
  const el={tabButtons:Array.from(document.querySelectorAll('[data-studio-tab]')),panels:{scenario:$('scenarioPanel'),data:$('dataPanel'),method:$('methodPanel')},profileNote:$('profileNote'),feedback:$('studioFeedback'),baseline:$('baselineIndex'),adapted:$('adaptedIndex'),baselineBar:$('baselineBar'),adaptedBar:$('adaptedBar'),baselineBarLabel:$('baselineBarLabel'),adaptedBarLabel:$('adaptedBarLabel'),reductionCaption:$('reductionCaption'),sensitivity:$('sensitivityBars'),actions:$('actionReadout'),preview:$('scenarioJsonPreview'),dataSearch:$('dataSearch'),dataCount:$('dataMatchCount')};
  const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  const numeric=(key)=>Number(inputs[key].value);
  const baseIndex=(vals)=>vals.hazard*(.25+.75*vals.exposure/100)*(.25+.75*vals.vulnerability/100);
  const getValues=()=>({profile:inputs.profile.value,hazard:numeric('hazard'),exposure:numeric('exposure'),vulnerability:numeric('vulnerability'),assumedInterventionReduction:{earlyWarning:numeric('warning'),criticalLifelineContinuity:numeric('lifeline'),foodWaterBuffers:numeric('buffer'),preparednessRecovery:numeric('preparedness')}});
  const round1=(n)=>Math.round(n*10)/10;
  const calc=()=>{
    const v=getValues();
    const baseline=baseIndex(v);
    const r=v.assumedInterventionReduction;
    const multiplier=(1-r.earlyWarning/100)*(1-r.criticalLifelineContinuity/100)*(1-r.foodWaterBuffers/100)*(1-r.preparednessRecovery/100);
    const adapted=baseline*multiplier;
    return {v,baseline:round1(baseline),adapted:round1(adapted),reduction:baseline>0?round1((1-adapted/baseline)*100):0,multiplier:round1(multiplier)};
  };
  const numberFormat=(n)=>Number(n).toFixed(1);
  function updateOutputs(){
    const result=calc();
    const v=result.v;
    [['hazard','hazardOutput',' / 100'],['exposure','exposureOutput',' / 100'],['vulnerability','vulnerabilityOutput',' / 100']].forEach(function(a){$(a[1]).textContent=inputs[a[0]].value+a[2];});
    [['warning','warningOutput'],['lifeline','lifelineOutput'],['buffer','bufferOutput'],['preparedness','preparednessOutput']].forEach(function(a){$(a[1]).textContent=inputs[a[0]].value+'%';});
    el.baseline.innerHTML=numberFormat(result.baseline)+'<span>/100</span>';
    el.adapted.innerHTML=numberFormat(result.adapted)+'<span>/100</span>';
    el.baselineBar.style.width=clamp(result.baseline,0,100)+'%';
    el.adaptedBar.style.width=clamp(result.adapted,0,100)+'%';
    el.baselineBarLabel.textContent=numberFormat(result.baseline);
    el.adaptedBarLabel.textContent=numberFormat(result.adapted);
    el.reductionCaption.textContent=result.baseline>0?numberFormat(result.reduction)+'% lower within the declared index formula.':'The baseline index is zero under the current assumptions.';
    drawSensitivity(result);
    drawActions();
    el.preview.textContent=JSON.stringify(buildExport(result),null,2);
    el.feedback.textContent='Updated locally · No inputs have been uploaded. Export records formula version and assumptions.';
  }
  function drawSensitivity(result){
    const v=result.v;
    const dimensions=[
      ['Hazard intensity',function(){const q=Object.assign({},v,{hazard:clamp(v.hazard-10,0,100)});return result.baseline-baseIndex(q);}],
      ['Exposure',function(){const q=Object.assign({},v,{exposure:clamp(v.exposure-10,0,100)});return result.baseline-baseIndex(q);}],
      ['Vulnerability',function(){const q=Object.assign({},v,{vulnerability:clamp(v.vulnerability-10,0,100)});return result.baseline-baseIndex(q);}]
    ].map(function(item){return {name:item[0],delta:Math.max(0,item[1]())};});
    const max=Math.max(.01,...dimensions.map(x=>x.delta));
    el.sensitivity.innerHTML=dimensions.map(function(d){return '<div class="sensitivity-row"><label>'+d.name+'</label><div class="sensitivity-track"><div class="sensitivity-fill" style="width:'+Math.max(0,d.delta/max*100)+'%"></div></div><b>'+numberFormat(d.delta)+'</b></div>';}).join('');
  }
  function drawActions(){
    const preset=profiles[inputs.profile.value];
    el.actions.innerHTML=preset.recommendations.map(function(a,i){return '<article><span>RESEARCH PROMPT / 0'+(i+1)+'</span><h4>'+a[0]+'</h4><p>'+a[1]+'</p></article>';}).join('');
  }
  function buildExport(result){
    return {project:'Climate Shock Lab — Risk Observatory',exportedAt:new Date().toISOString(),recordType:'educational scenario stress test',modelVersion:'decision-index-v1.0',profile:result.v.profile,profileLabel:labels[result.v.profile],profileNote:profiles[result.v.profile].note,inputs:{hazardStress_0to100:result.v.hazard,exposure_0to100:result.v.exposure,vulnerability_0to100:result.v.vulnerability,assumedInterventionReductionPercent:result.v.assumedInterventionReduction},formula:{baseline:'hazard * (0.25 + 0.75 * exposure/100) * (0.25 + 0.75 * vulnerability/100)',adapted:'baseline * product(1 - assumedInterventionReduction_i / 100)',coefficients:'The exposure/vulnerability factors and intervention percentages are conceptual design assumptions; intervention percentages are user-entered, not empirical effect sizes.'},outputs:{baselineIndex_0to100:result.baseline,adaptedIndex_0to100:result.adapted,withinModelRelativeIndexReductionPercent:result.reduction},interpretation:'Unitless educational index only. Not a probability, location forecast, casualty estimate, loss estimate, validated climate or hydrological simulation, or operational planning output.',sources:[{title:'Harrison et al. (2026), Accessible Climate and Impact Model Output for Studying the Human and Environmental Impacts of Nuclear Conflict',doi:'10.1002/gdj3.70076',url:'https://doi.org/10.1002/gdj3.70076',dataset:'https://osf.io/e28gq/'},{title:'IPCC AR6 WGI Chapter 11',url:'https://www.ipcc.ch/report/ar6/wg1/chapter/chapter-11/'},{title:'IPCC AR6 WGII Chapter 4: Water',url:'https://www.ipcc.ch/report/ar6/wg2/chapter/chapter-4/'}]};
  }
  function downloadFile(name,mime,content){
    const blob=new Blob([content],{type:mime});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(function(){URL.revokeObjectURL(url);},1000);
  }
  function csvEscape(v){const s=String(v==null?'':v);return '"'+s.replace(/"/g,'""')+'"';}
  function exportCsv(){
    const r=calc();const v=r.v;const items=[['field','value'],['model_version','decision-index-v1.0'],['profile',v.profile],['profile_label',labels[v.profile]],['hazard_stress_0_100',v.hazard],['exposure_0_100',v.exposure],['vulnerability_0_100',v.vulnerability],['assumed_early_warning_reduction_percent',v.assumedInterventionReduction.earlyWarning],['assumed_lifeline_reduction_percent',v.assumedInterventionReduction.criticalLifelineContinuity],['assumed_food_water_buffer_reduction_percent',v.assumedInterventionReduction.foodWaterBuffers],['assumed_preparedness_reduction_percent',v.assumedInterventionReduction.preparednessRecovery],['baseline_index_0_100',r.baseline],['adapted_index_0_100',r.adapted],['relative_index_reduction_percent',r.reduction],['interpretation','Conceptual index only; not a forecast or validated risk model'],['dataset_paper_doi','10.1002/gdj3.70076']];
    downloadFile('climate-shock-lab-scenario.csv','text/csv;charset=utf-8',items.map(row=>row.map(csvEscape).join(',')).join('\r\n')+'\r\n');
  }
  function loadParams(){
    const params=new URLSearchParams(window.location.search);
    if(params.has('profile')&&profiles[params.get('profile')])inputs.profile.value=params.get('profile');
    Object.keys(inputs).forEach(function(k){if(k==='profile')return;const key={hazard:'hazard',exposure:'exposure',vulnerability:'vulnerability',warning:'warning',lifeline:'lifeline',buffer:'buffer',preparedness:'preparedness'}[k];if(key&&params.has(key)){const n=Number(params.get(key));if(Number.isFinite(n))inputs[k].value=clamp(n,Number(inputs[k].min),Number(inputs[k].max));}});
  }
  function applyProfile(profile,keepInputs){
    inputs.profile.value=profile;const p=profiles[profile];if(!keepInputs){inputs.hazard.value=p.hazard;inputs.exposure.value=p.exposure;inputs.vulnerability.value=p.vulnerability;inputs.warning.value=p.warning;inputs.lifeline.value=p.lifeline;inputs.buffer.value=p.buffer;inputs.preparedness.value=p.preparedness;}
    el.profileNote.textContent=p.note;updateOutputs();
  }
  function shareSetup(){
    const result=calc(),url=new URL(window.location.href),v=result.v;
    url.search='';url.hash='';url.searchParams.set('profile',v.profile);
    [['hazard',v.hazard],['exposure',v.exposure],['vulnerability',v.vulnerability],['warning',v.assumedInterventionReduction.earlyWarning],['lifeline',v.assumedInterventionReduction.criticalLifelineContinuity],['buffer',v.assumedInterventionReduction.foodWaterBuffers],['preparedness',v.assumedInterventionReduction.preparednessRecovery]].forEach(function(a){url.searchParams.set(a[0],a[1]);});
    if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(url.href).then(function(){el.feedback.textContent='Shareable setup URL copied. Anyone opening it will load these assumptions.';}).catch(function(){el.feedback.textContent='Copy this share URL: '+url.href;window.prompt('Copy scenario URL',url.href);});}else{el.feedback.textContent='Copy this share URL from the dialog.';window.prompt('Copy scenario URL',url.href);}
  }
  el.tabButtons.forEach(function(btn){btn.addEventListener('click',function(){const key=btn.dataset.studioTab;el.tabButtons.forEach(function(b){const active=b===btn;b.classList.toggle('active',active);b.setAttribute('aria-selected',String(active));});Object.keys(el.panels).forEach(function(k){el.panels[k].hidden=k!==key;});});});
  inputs.profile.addEventListener('change',function(){applyProfile(inputs.profile.value,false);});
  ['hazard','exposure','vulnerability','warning','lifeline','buffer','preparedness'].forEach(function(k){inputs[k].addEventListener('input',updateOutputs);});
  $('resetStudio').addEventListener('click',function(){applyProfile(inputs.profile.value,false);});
  $('shareStudio').addEventListener('click',shareSetup);
  $('exportJson').addEventListener('click',function(){downloadFile('climate-shock-lab-scenario.json','application/json;charset=utf-8',JSON.stringify(buildExport(calc()),null,2)+'\n');});
  $('exportCsv').addEventListener('click',exportCsv);
  if(el.dataSearch){const cards=Array.from(document.querySelectorAll('.dataset-card'));const filter=function(){const q=el.dataSearch.value.trim().toLowerCase();let n=0;cards.forEach(function(c){const matches=!q||(c.textContent+' '+c.dataset.search+' '+c.dataset.category).toLowerCase().includes(q);c.classList.toggle('is-hidden',!matches);if(matches)n++;});el.dataCount.textContent=n+' of '+cards.length+' resources';};el.dataSearch.addEventListener('input',filter);}
  loadParams();
  applyProfile(inputs.profile.value,true);
})();