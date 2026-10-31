import test from 'node:test';
import assert from 'node:assert/strict';
import {USE_CHOICES,SOURCE_CHOICES,validateQuoteAnswers} from '../src/quoteChoices.js';
test('quote answers require at least one use and one source, with consent',()=>{
 const answer={uses:['use-yard','use-home-office'],source:{code:'google'},smsConsent:true};
 assert.equal(validateQuoteAnswers(answer),'');assert.match(validateQuoteAnswers({...answer,uses:[]}),/select what/);assert.match(validateQuoteAnswers({...answer,source:{}}),/heard/);assert.match(validateQuoteAnswers({...answer,smsConsent:false}),/agree/);
 assert.equal(USE_CHOICES.length,8);assert.equal(SOURCE_CHOICES.length,6);
});
test('referral and Other require their conditional explanations',()=>{
 const answer={uses:['use-other'],usesOther:'',source:{code:'referral'},smsConsent:true};
 assert.match(validateQuoteAnswers(answer),/describe/);answer.usesOther='Art studio';assert.match(validateQuoteAnswers(answer),/referred/);answer.source.referredBy='Jane';assert.equal(validateQuoteAnswers(answer),'');answer.source={code:'other'};assert.match(validateQuoteAnswers(answer),/heard/);answer.source.other='Local fair';assert.equal(validateQuoteAnswers(answer),'');
});
