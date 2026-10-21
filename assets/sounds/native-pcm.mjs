// Original WaveMix unsigned-8-bit arithmetic: 0x43dbe0 and 0x4389f0.
export const NATIVE_SAMPLE_RATE=11025;
export const NATIVE_VOLUME_TABLE=Uint8Array.from({length:11*256},(_,i)=>128+Math.trunc(((i&255)-128)*Math.floor(i/256)/10));
const volumeIndex=value=>Math.max(0,Math.min(10,Math.trunc(value)));
const volumePair=volume=>[volumeIndex(volume[0]),volumeIndex(volume[1])];

export function mixNativePcm(inputs,volumes,channels=1,length=inputs[0]?.length||0){
 if(![1,2].includes(channels)||length%channels||inputs.length>16||inputs.length!==volumes.length||inputs.some(input=>input.length<length))throw Error('Invalid native PCM mix');
 const pairs=volumes.map(volumePair),out=new Uint8Array(length);
 for(let i=0;i<length;i++){
  let value=128;
  for(let n=0;n<inputs.length;n++){
   const pair=pairs[n],volume=channels===2?pair[i&1]:Math.floor((pair[0]+pair[1])/2);
   value+=NATIVE_VOLUME_TABLE[volume*256+inputs[n][i]]-128;
  }
  out[i]=Math.max(0,Math.min(255,value));
 }
 return out;
}

// Preserve original CD samples instead of decoding/resampling each voice
// independently before the native byte-domain sum.
export function decodeNativeWav(input){
 const bytes=input instanceof Uint8Array?input:new Uint8Array(input),view=new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength);
 const tag=offset=>String.fromCharCode(...bytes.subarray(offset,offset+4));
 if(bytes.length<12||tag(0)!=='RIFF'||tag(8)!=='WAVE')throw Error('Invalid WAV header');
 const end=view.getUint32(4,true)+8;if(end>bytes.length)throw Error('Truncated WAV');
 let format=null,data=null;
 for(let offset=12;offset+8<=end;){
  const size=view.getUint32(offset+4,true),start=offset+8;if(start+size>end)throw Error('Truncated WAV chunk');
  if(tag(offset)==='fmt '){if(size<16)throw Error('Invalid WAV format');format={encoding:view.getUint16(start,true),channels:view.getUint16(start+2,true),rate:view.getUint32(start+4,true),align:view.getUint16(start+12,true),bits:view.getUint16(start+14,true)};}
  if(tag(offset)==='data')data=bytes.slice(start,start+size);
  offset=start+size+(size&1);
 }
 if(!format||format.encoding!==1||format.channels!==1||format.rate!==NATIVE_SAMPLE_RATE||format.align!==1||format.bits!==8||!data?.length)throw Error('Expected original mono 11025 Hz 8-bit PCM');
 return {pcm:data,sampleRate:NATIVE_SAMPLE_RATE,duration:data.length/NATIVE_SAMPLE_RATE};
}

export class NativePcmMixer{
 constructor(){this.voices=new Map();this.ended=[];this.phase=0;this.current=128;this.outputRate=null;this.nativeFrames=0;this.onSample=null;}
 start(id,bytes,loop=false,volumes=[10,10]){
  if(!(bytes instanceof Uint8Array)||!bytes.length)throw Error('Empty native PCM voice');
  if(!this.voices.has(id)&&this.voices.size>=16)throw Error('Too many native PCM voices');
  const pair=volumePair(volumes);this.voices.set(id,{bytes,loop,position:0,volume:Math.floor((pair[0]+pair[1])/2)});
 }
 stop(id){this.voices.delete(id);}
 clear(){this.voices.clear();this.ended=[];this.phase=0;this.current=128;this.outputRate=null;}
 sample(){
  let value=128;
  for(const [id,voice]of this.voices){
   value+=NATIVE_VOLUME_TABLE[voice.volume*256+voice.bytes[voice.position++]]-128;
   if(voice.position===voice.bytes.length){if(voice.loop)voice.position=0;else{this.voices.delete(id);this.ended.push(id);}}
  }
  const byte=Math.max(0,Math.min(255,value));this.nativeFrames++;this.onSample?.(byte);return byte;
 }
 renderNative(length){return Uint8Array.from({length},()=>this.sample());}
 // This sample-hold conversion is a browser output boundary. With the
 // requested 11025 Hz AudioContext there is exactly one native sample per
 // context frame; browser/device conversion follows after the worklet.
 render(output,outputRate){
  if(this.outputRate!==outputRate){this.outputRate=outputRate;this.phase=outputRate;}
  for(let i=0;i<output.length;i++){
   while(this.phase>=outputRate){this.current=this.sample();this.phase-=outputRate;}
   output[i]=(this.current-128)/128;this.phase+=NATIVE_SAMPLE_RATE;
  }
 }
 takeEnded(){const result=this.ended;this.ended=[];return result;}
}
