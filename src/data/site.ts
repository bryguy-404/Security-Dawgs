export const contactEmail = 'luke@wyckoffconsulting.com';

export function contactLink(service = 'Blast Radius') {
  return `mailto:${contactEmail}?subject=${encodeURIComponent(`Security Dawgs — ${service}`)}&body=${encodeURIComponent(`Hi Luke,\n\nI'd like to learn more about ${service.toLowerCase()} with Security Dawgs.\n\nCompany:\nBest way to reach me:\n\nThanks!`)}`;
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
