export const USE_CHOICES=[['use-yard','Yard tools'],['use-general-storage','General storage'],['use-home-office','Home office'],['use-garage','Garage'],['use-golf-cart','Golf cart'],['use-storage','Storage'],['use-mixed','Mixed use'],['use-other','Other']];
export const SOURCE_CHOICES=[['google','Google'],['vehicle-wrap','Vehicle wrap'],['yard-sign','Yard sign'],['social-media','Social media'],['referral','Referral'],['other','Other']];
export function validateQuoteAnswers({uses=[],usesOther='',source={},smsConsent=false}){
 if(!uses.length)return 'Please select what you plan to use your shed for.';
 if(uses.includes('use-other')&&!usesOther.trim())return 'Please describe your other shed use.';
 if(!source.code)return 'Please select how you heard about us.';
 if(source.code==='referral'&&!source.referredBy?.trim())return 'Please enter who referred you.';
 if(source.code==='other'&&!source.other?.trim())return 'Please tell us how you heard about us.';
 if(!smsConsent)return 'Please agree to receive texts about your shed inquiry.';
 return '';
}
