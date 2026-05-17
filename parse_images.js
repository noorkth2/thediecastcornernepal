const fs = require('fs');
fetch("https://en.wikipedia.org/w/api.php?action=query&titles=Lamborghini_Urus|Porsche_911_GT3|Ferrari_SF90_Stradale|Toyota_Supra|Nissan_GT-R|Honda_NSX|Toyota_Land_Cruiser|Datsun_510|Jeep_Gladiator|Pontiac_GTO|Dodge_Charger|Ford_Mustang_Mach-E|Lamborghini_Sian|Toyota_86|Honda_Civic_Type_R|Mitsubishi_Lancer_Evolution|Porsche_911|Chevrolet_Chevelle|Ford_Mustang|Honda_City|Ferrari_F40|Lamborghini_Countach|Mazda_RX-7&prop=pageimages&format=json&pithumbsize=600")
  .then(res => res.json())
  .then(data => {
    const pages = data.query.pages;
    const images = {};
    for (const key in pages) {
      if (pages[key].thumbnail) {
        images[pages[key].title] = pages[key].thumbnail.source;
      }
    }
    console.log(JSON.stringify(images, null, 2));
  });
