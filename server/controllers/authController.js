const presetOfficers = [
  {
    uid: "officer_tn_001",
    email: "inspector.subramaniam@police.gov.in",
    name: "Insp. R. Subramaniam",
    rank: "Inspector of Police (SHO)",
    station: "Anna Nagar Police Station (K-4)",
    district: "Chennai City Police",
    badgeNumber: "TN-POL-8842",
    role: "police",
    state: "Tamil Nadu"
  },
  {
    uid: "officer_dl_002",
    email: "si.rajeshkumar@delhipolice.gov.in",
    name: "Sub-Insp. Rajesh Kumar",
    rank: "Sub-Inspector",
    station: "Connaught Place Police Station",
    district: "New Delhi District Police",
    badgeNumber: "DL-POL-1049",
    role: "police",
    state: "Delhi"
  },
  {
    uid: "officer_ka_003",
    email: "insp.priyarao@ksp.gov.in",
    name: "Insp. Priya Rao",
    rank: "Cyber Crime Inspector",
    station: "Cyber Crime Police Station",
    district: "Bengaluru City Police",
    badgeNumber: "KA-POL-4419",
    role: "police",
    state: "Karnataka"
  }
];

function getOfficerProfile(req, res) {
  const user = req.user || presetOfficers[0];
  res.json({
    success: true,
    data: user
  });
}

function getAvailableOfficers(req, res) {
  res.json({
    success: true,
    data: presetOfficers
  });
}

module.exports = {
  getOfficerProfile,
  getAvailableOfficers,
  presetOfficers
};
