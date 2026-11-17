export const PICKUP_STYLES = ["Porch pickup", "Hand-off at my place", "Meet up nearby", "I can drop it off"] as const;
export const RECEIVER_REPLIES = ["Thank you! When can I grab it?", "On my way!", "Running 10 minutes late, sorry", "Got it — thank you!"];
export const GIVER_REPLIES: Record<string,string[]> = {
  "Porch pickup": ["I'll leave it on my porch 📦", "Grab it anytime today", "Let me know when you're on your way"],
  "Hand-off at my place": ["Can you come by at 6?", "I'm home after 5 today", "Text me when you're outside"],
  "Meet up nearby": ["Want to meet near campus?", "I can meet before class", "Which spot works for you?"],
  "I can drop it off": ["I can drop it off — where's good?", "I'm free this evening", "Heading over now"],
};
export const THANK_LIMIT = 200;
const zone = "America/Los_Angeles";
export function pickupLabel(value:string) { return new Date(value).toLocaleString("en-US",{timeZone:zone,weekday:"short",month:"short",day:"numeric",hour:"numeric",minute:"2-digit"}); }
function parts(date:Date) { return Object.fromEntries(new Intl.DateTimeFormat("en-US",{timeZone:zone,year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",hourCycle:"h23",minute:"2-digit",weekday:"short"}).formatToParts(date).map(p=>[p.type,p.value])); }
function localDate(year:number,month:number,day:number,hour:number,minute=0) {
  const target=Date.UTC(year,month-1,day,hour,minute); let result=new Date(target);
  for(let i=0;i<3;i++){const p=parts(result);const represented=Date.UTC(Number(p["year"]),Number(p["month"])-1,Number(p["day"]),Number(p["hour"]),Number(p["minute"]));result=new Date(result.getTime()+target-represented);}
  return result;
}
/** Explicitly suggested Los Angeles slots, never a booking. */
export function suggestedTimes(now:Date,preferences:string[]):string[] {
 const p=parts(now),y=Number(p["year"]),m=Number(p["month"]),d=Number(p["day"]);
 const at=(offset:number,hour:number,minute=0)=>localDate(y,m,d+offset,hour,minute);
 const candidates:Date[]=[];
 if(!preferences.length){
  const soon=new Date(Math.ceil((now.getTime()+2*3600000)/3600000)*3600000);
  if(parts(soon)["day"]===p["day"] && Number(parts(soon)["hour"])<20)candidates.push(soon);
  candidates.push(at(0,19),at(1,9),at(1,12,30));
  let offset=1;while(parts(at(offset,10))["weekday"]!=="Sat")offset++;candidates.push(at(offset,10));
  // If today's slots passed, fill with upcoming safe daytime slots.
  candidates.push(at(2,9),at(2,12,30),at(3,9));
 }else{
  for(let offset=0;offset<35;offset++){
   const weekend=["Sat","Sun"].includes(parts(at(offset,10))["weekday"]??"");
   for(const hour of [9,10,12,17,18,19])if(preferences.includes("Flexible") || weekend&&preferences.includes("Weekends") || !weekend&&(hour<12&&preferences.includes("Weekday mornings") || hour>=17&&preferences.includes("Weekday evenings")))candidates.push(at(offset,hour));
  }
 }
 const future=candidates.filter(t=>t>now);
 return [...new Set((preferences.length?future.sort((a,b)=>a.getTime()-b.getTime()):future).map(t=>t.toISOString()))].slice(0,5);
}
export function calendarFile(title:string,time:string){
 const escape=(v:string)=>v.replace(/\\/g,"\\\\").replace(/\r?\n/g,"\\n").replace(/,/g,"\\,").replace(/;/g,"\\;");
 const stamp=(v:Date)=>v.toISOString().replace(/[-:]/g,"").replace(/\.\d{3}/,"");
 return ["BEGIN:VCALENDAR","VERSION:2.0","PRODID:-//Passalong//Pickup//EN","BEGIN:VEVENT",`UID:pickup-${stamp(new Date(time))}@passalong`,`DTSTAMP:${stamp(new Date())}`,`DTSTART:${stamp(new Date(time))}`,`DTEND:${stamp(new Date(new Date(time).getTime()+3600000))}`,`SUMMARY:${escape(title)}`,"END:VEVENT","END:VCALENDAR"].join("\r\n");
}