import {createFluidSynth} from './fluid-synth.mjs';
import {MidiStream} from './midi-stream.mjs';
const module=AudioWorkletGlobalScope.wasmModule;
const ready=module?.calledRun?Promise.resolve():new Promise((resolve,reject)=>{if(!module){reject(Error('FluidSynth module unavailable'));return;}const previous=module.onRuntimeInitialized;module.onRuntimeInitialized=()=>{previous?.();resolve();};});
class HoverMidiProcessor extends AudioWorkletProcessor{
 constructor(){
  super();this.synth=null;this.stream=null;this.soundfont=null;this.generation=0;this.captures=[];this.disposed=false;this.reportFrame=0;
  this.port.onmessage=({data})=>{try{
   if(data.type==='init')ready.then(()=>{if(this.disposed)return;this.soundfont=data.soundfont;this.port.postMessage({type:'ready',sampleRate});}).catch(error=>this.error(error));
   if(data.type==='load'){
    if(!this.soundfont)throw Error('SoundFont not initialized');
    this.synth?.dispose();this.synth=null;this.stream=null;this.generation=data.generation;
    this.synth=createFluidSynth(module,sampleRate,this.soundfont);this.stream=new MidiStream(data.song,sampleRate,this.synth);this.reportFrame=0;
    this.captures=(data.captures||[]).map(c=>({...c,left:new Float32Array(c.length),right:new Float32Array(c.length),written:0}));
    this.port.postMessage({type:'loaded',generation:this.generation,sampleRate});
   }
   if(data.type==='clear'){this.synth?.dispose();this.synth=null;this.stream=null;this.captures=[];this.generation=data.generation;}
   if(data.type==='playing'&&data.generation===this.generation&&this.stream){this.stream.playing=!!data.value;this.state();}
   if(data.type==='state')this.state(data.id);
   if(data.type==='dispose'){this.synth?.dispose();this.synth=null;this.stream=null;this.soundfont=null;this.disposed=true;}
  }catch(error){this.error(error);}};
 }
 state(id){this.port.postMessage({type:'state',id,generation:this.generation,frame:this.stream?.frame||0,cycle:this.stream?.cycle||0,playing:!!this.stream?.playing,sampleRate});}
 error(error){if(this.stream)this.stream.playing=false;this.port.postMessage({type:'error',generation:this.generation,message:String(error)});}
 process(inputs,outputs){
  if(this.disposed)return false;const [left,right]=outputs[0]||[];if(!left||!right)return true;
  if(!this.stream){left.fill(0);right.fill(0);return true;}
  try{
   const begin=this.stream.frame;this.stream.render(left,right);const end=this.stream.frame;
   for(const c of this.captures){const from=Math.max(begin,c.startFrame),to=Math.min(end,c.startFrame+c.length);if(to>from){c.left.set(left.subarray(from-begin,to-begin),from-c.startFrame);c.right.set(right.subarray(from-begin,to-begin),from-c.startFrame);c.written+=to-from;}if(c.written===c.length&&!c.sent){c.sent=true;this.port.postMessage({type:'capture',id:c.id,generation:this.generation,startFrame:c.startFrame,left:c.left,right:c.right},[c.left.buffer,c.right.buffer]);}}
   this.captures=this.captures.filter(c=>!c.sent);
   if(end-this.reportFrame>=sampleRate/4){this.reportFrame=end;this.state();}
  }catch(error){left.fill(0);right.fill(0);this.error(error);}
  return true;
 }
}
registerProcessor('hover-midi',HoverMidiProcessor);
