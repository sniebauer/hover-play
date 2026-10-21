// Small adapter around the unmodified pinned FluidSynth WASM module.
export function createFluidSynth(module,rate,soundfont){
 const num=module.cwrap('fluid_settings_setnum','number',['number','string','number']);
 const integer=module.cwrap('fluid_settings_setint','number',['number','string','number']);
 const load=module.cwrap('fluid_synth_sfload','number',['number','string','number']);
 const settings=module._new_fluid_settings();let synth=0,memory=0,capacity=0;
 try{
  num(settings,'synth.sample-rate',rate);num(settings,'synth.gain',.2);integer(settings,'synth.polyphony',256);
  synth=module._new_fluid_synth(settings);if(!synth)throw Error('FluidSynth initialization failed');
  const path='/hover-'+synth+'.sf2';module.FS.writeFile(path,soundfont);
  try{if(load(synth,path,1)<0)throw Error('SoundFont could not load');}finally{module.FS.unlink(path);}
 }catch(error){if(synth)module._delete_fluid_synth(synth);module._delete_fluid_settings(settings);throw error;}
 return {
  dispatch(message){
   const channel=message&15,a=(message>>8)&127,b=(message>>16)&127;
   switch(message&240){
    case 0x80:module._fluid_synth_noteoff(synth,channel,a);break;
    case 0x90:module._fluid_synth_noteon(synth,channel,a,b);break;
    case 0xa0:module._fluid_synth_key_pressure(synth,channel,a,b);break;
    case 0xb0:module._fluid_synth_cc(synth,channel,a,b);break;
    case 0xc0:module._fluid_synth_program_change(synth,channel,a);break;
    case 0xd0:module._fluid_synth_channel_pressure(synth,channel,a);break;
    case 0xe0:module._fluid_synth_pitch_bend(synth,channel,a+(b<<7));break;
   }
  },
  render(left,right){
   const length=left.length;if(!length)return;
   if(length>capacity){if(memory)module._free(memory);capacity=Math.max(length,4096);memory=module._malloc(capacity*8);}
   const second=memory+capacity*4;
   if(module._fluid_synth_write_float(synth,length,memory,0,1,second,0,1)!==0)throw Error('FluidSynth render failed');
   left.set(new Float32Array(module.HEAPU8.buffer,memory,length));right.set(new Float32Array(module.HEAPU8.buffer,second,length));
  },
  dispose(){if(!synth)return;module._delete_fluid_synth(synth);module._delete_fluid_settings(settings);if(memory)module._free(memory);synth=0;memory=0;},
 };
}
