import {NativePcmMixer,NATIVE_SAMPLE_RATE} from './native-pcm.mjs';

class HoverNativeMixerProcessor extends AudioWorkletProcessor{
 constructor(){
  super();this.mixer=new NativePcmMixer();this.capture=null;
  this.mixer.onSample=byte=>{
   const capture=this.capture;if(!capture)return;
   capture.bytes[capture.position++]=byte;
   if(capture.position===capture.bytes.length){this.capture=null;this.port.postMessage({type:'capture',id:capture.id,bytes:capture.bytes,sampleRate,nativeRate:NATIVE_SAMPLE_RATE},[capture.bytes.buffer]);}
  };
  this.port.onmessage=({data})=>{
   try{
    if(data.type==='start')this.mixer.start(data.id,data.pcm,data.loop,data.volumes,data.frameLimit);
    if(data.type==='stop')this.mixer.stop(data.id);
    if(data.type==='clear'){this.mixer.clear();this.capture=null;}
    // Authored verification captures bytes produced by process(), before
    // the explicitly separate context/device output conversion.
    if(data.type==='capture'){
     this.mixer.clear();this.capture={id:data.id,bytes:new Uint8Array(data.length),position:0};
     for(const [index,voice]of data.voices.entries())this.mixer.start(index,voice.pcm,voice.loop||false,voice.volumes,voice.frameLimit);
     if(!data.length){this.port.postMessage({type:'capture',id:data.id,bytes:new Uint8Array(0),sampleRate,nativeRate:NATIVE_SAMPLE_RATE});this.capture=null;}
    }
   }catch(error){this.port.postMessage({type:'error',message:String(error)});}
  };
  this.port.postMessage({type:'ready',sampleRate,nativeRate:NATIVE_SAMPLE_RATE});
 }
 process(inputs,outputs){
  const channels=outputs[0];if(!channels?.length)return true;
  this.mixer.render(channels[0],sampleRate);
  for(let i=1;i<channels.length;i++)channels[i].set(channels[0]);
  const ended=this.mixer.takeEnded();if(ended.length)this.port.postMessage({type:'ended',ids:ended});
  return true;
 }
}
registerProcessor('hover-native-mixer',HoverNativeMixerProcessor);
