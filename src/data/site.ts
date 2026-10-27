export const contactEmail = 'luke@wyckoffconsulting.com';

export function contactLink(service = 'Blast Radius') {
  return `/contact/?interest=${encodeURIComponent(service)}`;
}

export const navigation = [
  {href: '/asset-intelligence/', label: 'Asset Intelligence'},
  {href: '/mdr/', label: 'MDR'},
  {href: '/compliance/', label: 'Compliance'},
  {href: '/awareness-training/', label: 'Human Risk'},
  {href: '/industries/', label: 'Industries'},
];

export const serviceInterests = {
  mdr: 'Blast Radius',
  compliance: 'Free Compliance Review',
  'awareness-training': 'Free Phishing Test',
};
