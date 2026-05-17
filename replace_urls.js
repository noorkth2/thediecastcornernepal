const fs = require('fs');
let content = fs.readFileSync('supabase/migrations/99999999999999_seed_dummy_data.sql', 'utf8');

const replacements = [
  ['https://placehold.co/600x600/0a0a0a/ef4444?text=R34+BaysideBlue', 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/06/Nissan_Skyline_GT-R_R34_V_Spec_II.jpg/600px-Nissan_Skyline_GT-R_R34_V_Spec_II.jpg'],
  ['https://placehold.co/600x600/0a0a0a/facc15?text=Urus+Pearl', 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f1/Lamborghini_Urus_SE_DSC_8524.jpg/600px-Lamborghini_Urus_SE_DSC_8524.jpg'],
  ['https://placehold.co/600x600/0a0a0a/f97316?text=911+GT3RS', 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Porsche_992_GT3_1X7A0323.jpg/600px-Porsche_992_GT3_1X7A0323.jpg'],
  ['https://placehold.co/600x600/0a0a0a/dc2626?text=SF90+Red', 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/13/Red_2019_Ferrari_SF90_Stradale_%2848264238897%29_%28cropped%29.jpg/600px-Red_2019_Ferrari_SF90_Stradale_%2848264238897%29_%28cropped%29.jpg'],
  ['https://placehold.co/600x600/0a0a0a/f8fafc?text=Supra+MK4', 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/28/Toyota_GR_Supra_%2851984008283crop%29.jpg/600px-Toyota_GR_Supra_%2851984008283crop%29.jpg'],
  ['https://placehold.co/600x600/0a0a0a/7c3aed?text=GTR+Purple', 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ef/2009-2010_Nissan_GT-R_%28R35%29_coupe_01.jpg/600px-2009-2010_Nissan_GT-R_%28R35%29_coupe_01.jpg'],
  ['https://placehold.co/600x600/0a0a0a/e2e8f0?text=NSX+TypeR', 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/21/AcuraNSX-05-cropped.jpg/600px-AcuraNSX-05-cropped.jpg'],
  ['https://placehold.co/600x600/0a0a0a/eab308?text=LC76+Chase', 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6d/2021_Toyota_Land_Cruiser_300_3.4_ZX_%28Colombia%29_front_view_04.png/600px-2021_Toyota_Land_Cruiser_300_3.4_ZX_%28Colombia%29_front_view_04.png'],
  ['https://placehold.co/600x600/0a0a0a/2563eb?text=Datsun+510', 'https://upload.wikimedia.org/wikipedia/commons/e/e1/510BluebirdSSS.jpg'],
  ['https://placehold.co/600x600/0a0a0a/ca8a04?text=Gladiator', 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/2020_Jeep_Gladiator_Rubicon.jpg/600px-2020_Jeep_Gladiator_Rubicon.jpg'],
  ['https://placehold.co/600x600/0a0a0a/16a34a?text=Pontiac+GTO', 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/30/2005_Pontiac_GTO%2C_front_left%2C_10-28-2022.jpg/600px-2005_Pontiac_GTO%2C_front_left%2C_10-28-2022.jpg'],
  ['https://placehold.co/600x600/0a0a0a/1c1917?text=Charger+RT', 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/62/1969_Dodge_Charger_%2821572136732%29.jpg/600px-1969_Dodge_Charger_%2821572136732%29.jpg'],
  ['https://placehold.co/600x600/0a0a0a/1d4ed8?text=Mach-E+Blue', 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/49/2021_Ford_Mustang_Mach-E_Standard_Range_Front.jpg/600px-2021_Ford_Mustang_Mach-E_Standard_Range_Front.jpg'],
  ['https://placehold.co/600x600/0a0a0a/b45309?text=Sian+Gold', 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/77/Lamborghini_Sian_FKP37_at_IAA_2019_IMG_0350.jpg/600px-Lamborghini_Sian_FKP37_at_IAA_2019_IMG_0350.jpg'],
  ['https://placehold.co/600x600/0a0a0a/b91c1c?text=GR86+Red', 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/50/2022_Toyota_GR86_Premium_in_Halo%2C_Front_Right%2C_04-10-2022.jpg/600px-2022_Toyota_GR86_Premium_in_Halo%2C_Front_Right%2C_04-10-2022.jpg'],
  ['https://placehold.co/600x600/0a0a0a/f8fafc?text=EK9+TypeR', 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/71/2024_Honda_Civic_Type_R%2C_front_right%2C_06-15-2024.jpg/600px-2024_Honda_Civic_Type_R%2C_front_right%2C_06-15-2024.jpg'],
  ['https://placehold.co/600x600/0a0a0a/dc2626?text=Evo6+Tommi', 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/2017-04-02_Mitsubishi_Lancer_Evolution_X_MR_SST_14_%282%29.jpg/600px-2017-04-02_Mitsubishi_Lancer_Evolution_X_MR_SST_14_%282%29.jpg'],
  ['https://placehold.co/600x600/0a0a0a/dc2626?text=911+RSR', 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Porsche_911_No_1000000%2C_70_Years_Porsche_Sports_Car%2C_Berlin_%281X7A3888%29.jpg/600px-Porsche_911_No_1000000%2C_70_Years_Porsche_Sports_Car%2C_Berlin_%281X7A3888%29.jpg'],
  ['https://placehold.co/600x600/0a0a0a/f97316?text=NSX+GT3', 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/21/AcuraNSX-05-cropped.jpg/600px-AcuraNSX-05-cropped.jpg'],
  ['https://placehold.co/600x600/0a0a0a/dc2626?text=Chevelle+SS', 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/df/1970_Chevrolet_Chevelle_SS_396_Sport_Coupe%2C_front_left%2C_06-08-2024.jpg/600px-1970_Chevrolet_Chevelle_SS_396_Sport_Coupe%2C_front_left%2C_06-08-2024.jpg'],
  ['https://placehold.co/600x600/0a0a0a/166534?text=Mustang+GT390', 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9c/Ford_Mustang_VII_GT_Rutesheimer_Autoschau_2025_DSC_9234.jpg/600px-Ford_Mustang_VII_GT_Rutesheimer_Autoschau_2025_DSC_9234.jpg'],
  ['https://placehold.co/600x600/0a0a0a/b91c1c?text=City+Turbo2', 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/2022_Honda_City_ZX_i-VTEC_%28India%29_front_view_%28cropped%29.jpg/600px-2022_Honda_City_ZX_i-VTEC_%28India%29_front_view_%28cropped%29.jpg'],
  ['https://placehold.co/600x600/0a0a0a/dc2626?text=F40+1:18', 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/86/1989_Ferrari_F40_SCD_24.jpg/600px-1989_Ferrari_F40_SCD_24.jpg'],
  ['https://placehold.co/600x600/0a0a0a/f8fafc?text=Countach+25th', 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/48/Lamborghini_Countach_-_Flickr_-_exfordy_%282%29_%28cropped-2%29.jpg/600px-Lamborghini_Countach_-_Flickr_-_exfordy_%282%29_%28cropped-2%29.jpg'],
  ['https://placehold.co/600x600/0a0a0a/1d4ed8?text=R32+GroupA', 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/06/Nissan_Skyline_GT-R_R34_V_Spec_II.jpg/600px-Nissan_Skyline_GT-R_R34_V_Spec_II.jpg'],
  ['https://placehold.co/600x600/0a0a0a/7c3aed?text=RX7+FD+RE', 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/1994_Mazda_RX-7_R2_in_Vintage_Red%2C_front_left_%28Lime_Rock%29.jpg/600px-1994_Mazda_RX-7_R2_in_Vintage_Red%2C_front_left_%28Lime_Rock%29.jpg']
];

replacements.forEach(([oldStr, newStr]) => {
  content = content.replace(oldStr, newStr);
});

fs.writeFileSync('supabase/migrations/99999999999999_seed_dummy_data.sql', content);
console.log('Replaced images successfully.');
