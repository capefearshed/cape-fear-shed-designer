export function validateOwnerContact(customer){
 if(!customer.firstName?.trim()||!customer.lastName?.trim())return 'Please enter a first and last name.';
 if(customer.phone?.trim()&&customer.phone.replace(/\D/g,'').length!==10)return 'Enter a 10-digit mobile phone number.';
 if(customer.email?.trim()&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer.email))return 'Enter a valid email address.';
 if(customer.address?.zip?.trim()&&!/^\d{5}$/.test(customer.address.zip))return 'Enter a 5-digit ZIP code.';
 return '';
}
