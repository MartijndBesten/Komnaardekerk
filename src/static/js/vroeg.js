/* Zet direct class 'js' op <html>, vóór de eerste weergave: voorkomt dat het mobiele menu eerst openstaat en de pagina daarna verspringt. */
document.documentElement.className = document.documentElement.className.replace('geen-js', 'js');
