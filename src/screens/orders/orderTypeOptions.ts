export const femaleTypeOptions = [
  { label: 'Traditional Wear', value: '__group-Traditional Wear', disabled: true },
  { label: 'Salwar Kameez', value: 'Salwar Kameez' },
  { label: 'Churidar Suit', value: 'Churidar Suit' },
  { label: 'Anarkali', value: 'Anarkali' },
  { label: 'Kurti with Palazzo/Pants', value: 'Kurti with Palazzo/Pants' },
  { label: 'Lehenga Choli', value: 'Lehenga Choli' },
  { label: 'Blouse (for saree)', value: 'Blouse (for saree)' },
  { label: 'Saree Petticoat', value: 'Saree Petticoat' },
  { label: 'Saree Fall & Pico (stitching service)', value: 'Saree Fall & Pico (stitching service)' },
  { label: 'Princess cut blouse', value: 'Princess cut blouse' },
  { label: 'Western Wear', value: '__group-Wester Wear', disabled: true },
  { label: 'Dress (A-line, Bodycon, Maxi, etc.)', value: 'Dress' },
  { label: 'Formal Shirt', value: 'Formal Shirt' },
  { label: 'Trousers', value: 'Trousers' },
  { label: 'Jumpsuit', value: 'Jumpsuit' },
  { label: 'Puff sleeves kurti', value: 'Puff sleeves kurti' },
  { label: 'Flared palazzo', value: 'Flared palazzo' },
  { label: 'Asymmetrical dress', value: 'Asymmetrical dress' },
];

export const maleTypeOptions = [
  { label: 'Traditional Wear', value: '__group-Traditional Wear', disabled: true },
  { label: 'Kurta', value: 'Kurta' },
  { label: 'Kurta Pajama', value: 'Kurta Pajama' },
  { label: 'Sherwani', value: 'Sherwani' },
  { label: 'Dhoti Kurta', value: 'Dhoti Kurta' },
  { label: 'Western/Formal Wear', value: '__group-Western/Formal Wear', disabled: true },
  { label: 'Shirt', value: 'Shirt' },
  { label: 'Casual Shirt', value: 'Casual Shirt' },
  { label: 'Formal Shirt', value: 'Formal Shirt' },
  { label: 'Half Sleeve / Full Sleeve', value: 'Half Sleeve / Full Sleeve' },
  { label: 'Pant / Trouser', value: 'Pant / Trouser' },
  { label: 'Blazer / Coat / Suit', value: 'Blazer / Coat / Suit' },
  { label: 'Tuxedo', value: 'Tuxedo' },
  { label: '3-piece Suit', value: '3-piece Suit' },
  { label: 'Shorts', value: 'Shorts' },
  { label: 'Jeans (Custom Fit)', value: 'Jeans (Custom Fit)' },
  { label: 'Outerwear / Add-ons', value: '__group-Outerwear / Add-ons', disabled: true },
];

interface TypeOption {
  label: string;
  value: string;
  disabled?: boolean;
}

function sortOptionsWithGroups(options: TypeOption[]): TypeOption[] {
  const result: TypeOption[] = [];
  let group: TypeOption[] = [];
  let groupHeader: TypeOption | null = null;
  for (const opt of options) {
    if (opt.disabled) {
      if (groupHeader && group.length) {
        // Sort previous group and push
        result.push(groupHeader);
        result.push(...group.sort((a, b) => a.label.localeCompare(b.label)));
      }
      groupHeader = opt;
      group = [];
    } else {
      group.push(opt);
    }
  }
  if (groupHeader && group.length) {
    result.push(groupHeader);
    result.push(...group.sort((a, b) => a.label.localeCompare(b.label)));
  }
  return result;
}

export const sortedFemaleTypeOptions = sortOptionsWithGroups(femaleTypeOptions);
export const sortedMaleTypeOptions = sortOptionsWithGroups(maleTypeOptions);

export const femaleTypeLabels = sortedFemaleTypeOptions.filter(opt => !opt.disabled).map(opt => opt.label);
export const maleTypeLabels = sortedMaleTypeOptions.filter(opt => !opt.disabled).map(opt => opt.label); 