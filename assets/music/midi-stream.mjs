// Original SMF exports contain one track, explicit channel messages and tempo.
export function parseMidi(input){
 const bytes=input instanceof Uint8Array?input:new Uint8Array(input),view=new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength);
 const tag=at=>String.fromCharCode(...bytes.subarray(at,at+4));
 if(bytes.length<22||tag(0)!=='MThd'||view.getUint32(4)!==6||view.getUint16(8)!==0||view.getUint16(10)!==1||tag(14)!=='MTrk'||view.getUint32(18)+22!==bytes.length)throw Error('Expected original single-track MIDI');
 const division=view.getUint16(12);if(!division||division&0x8000)throw Error('Unsupported MIDI division');
 let at=22,tempo=500000,units=0,ticks=0,ended=false;const events=[];
 const byte=()=>{if(at>=bytes.length)throw Error('Truncated MIDI');return bytes[at++];};
 const vlq=()=>{let value=0;for(let i=0;i<4;i++){const next=byte();value=value*128+(next&127);if(!(next&128))return value;}throw Error('Invalid MIDI delta');};
 while(at<bytes.length){
  const delta=vlq();ticks+=delta;units+=delta*tempo;const status=byte();
  if(status===255){
   const kind=byte(),length=vlq();
   if(kind===0x2f&&length===0){ended=true;break;}
   if(kind!==0x51||length!==3)throw Error('Unexpected original MIDI metadata');
   tempo=byte()*65536+byte()*256+byte();if(!tempo)throw Error('Invalid MIDI tempo');events.push({units,message:0x1000000+tempo});
  }else{
   if(status<0x80||status>=0xf0)throw Error('Unsupported MIDI message');
   const a=byte(),b=[0xc0,0xd0].includes(status&240)?0:byte();if(a>127||b>127)throw Error('Invalid MIDI data');
   events.push({units,message:status+(a<<8)+(b<<16)});
  }
 }
 if(!ended||at!==bytes.length||!units||!events.length||events[0].units!==0||events[0].message>>>24!==1)throw Error('Invalid original MIDI loop');
 return {division,durationUnits:units,duration:units/(division*1000000),ticks,events};
}

export class MidiStream{
 constructor(song,rate,synth){
  if(!song?.durationUnits||!song.division||!song.events?.length||rate<=0)throw Error('Invalid MIDI stream');
  Object.assign(this,{song,rate,synth,frame:0,cycle:0,cursor:0,playing:false});
 }
 target(units){return Math.round((this.cycle*this.song.durationUnits+units)*this.rate/(this.song.division*1000000));}
 render(left,right){
  left.fill(0);right.fill(0);if(!this.playing)return;
  let at=0;
  while(at<left.length){
   while(this.cursor<this.song.events.length&&this.target(this.song.events[this.cursor].units)<=this.frame){const event=this.song.events[this.cursor++];if(event.message>>>24===0)this.synth.dispatch(event.message);}
   if(this.cursor===this.song.events.length&&this.target(this.song.durationUnits)<=this.frame){this.cycle++;this.cursor=0;continue;}
   const next=this.cursor<this.song.events.length?this.target(this.song.events[this.cursor].units):this.target(this.song.durationUnits);
   const length=Math.min(left.length-at,next-this.frame);
   if(length<=0)throw Error('MIDI schedule did not advance');
   this.synth.render(left.subarray(at,at+length),right.subarray(at,at+length));at+=length;this.frame+=length;
  }
 }
}
