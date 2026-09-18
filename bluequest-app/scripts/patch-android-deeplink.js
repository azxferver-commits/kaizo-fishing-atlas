const fs=require("fs");
const path=require("path");

const manifest=path.resolve(__dirname,"..","android","app","src","main","AndroidManifest.xml");
let xml=fs.readFileSync(manifest,"utf8");

const marker='android:scheme="bluequest"';
if(!xml.includes(marker)){
  const filter=`
            <intent-filter>
                <action android:name="android.intent.action.VIEW" />
                <category android:name="android.intent.category.DEFAULT" />
                <category android:name="android.intent.category.BROWSABLE" />
                <data android:scheme="bluequest" android:host="welcome" />
            </intent-filter>`;
  const activityClose="        </activity>";
  if(!xml.includes(activityClose)) throw new Error("No se encontró MainActivity en AndroidManifest.xml");
  xml=xml.replace(activityClose,filter+"\n"+activityClose);
  fs.writeFileSync(manifest,xml);
}
console.log("BlueQuest deep link ready: bluequest://welcome");
