export const referralLevels = [
  {
    level: 'Steel',
    criteria: { userReferred: 1, NoOfTransactions: 1000 },
    mainCommission: 3,
    airtimeCommission: '0.3%',
  },
  {
    level: 'Bronze',
    criteria: { userReferred: 501, NoOfTransactions: 50000 },
    mainCommission: 4,
    airtimeCommission: '0.35',
  },
  {
    level: 'Silver',
    criteria: { userReferred: 1001, NoOfTransactions: 250000 },
    mainCommission: 5,
    airtimeCommission: '0.4%',
  },
  {
    level: 'Gold',
    criteria: { userReferred: 5001, NoOfTransactions: 100000 },
    mainCommission: 10,
    airtimeCommission: 'o.5%',
  },
  {
    level: 'Platinum',
    criteria: { userReferred: 10000, NoOfTransactions: 1000000 },
    mainCommission: 15,
    airtimeCommission: '1.2%',
  },
];
