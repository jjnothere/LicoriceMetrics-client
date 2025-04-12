// Color mappings for displaying changes
const colorMapping = {
  // Green - Budgets, bids, cost caps, spend type (daily/lifetime)
  'Daily Budget': '#32CD32', // Lime Green
  'Unit Cost': '#32CD32', // Lime Green
  'Cost Type': '#32CD32', // Lime Green
  'Pacing Strategy': '#32CD32', // Lime Green

  // Yellow - Audience targeting
  'Targeting Criteria': '#FFD700', // Gold
  'Audience Expansion': '#FFD700', // Gold
  
  // Purple - Objective, location, and language
  'Objective Type': '#800080', // Purple
  'Location': '#800080', // Purple
  'Language': '#800080', // Purple
  Locale: '#800080', // Gold

  // Light Blue - Ad type
  Format: '#87CEFA', // Light Sky Blue
  'Ad Type': '#87CEFA', // Light Sky Blue
  'Campaign Type': '#87CEFA', // Light Sky Blue

  // Red - Status/name changes (campaign group & campaign levels only)
  Status: '#FF4500', // Orange Red
  Name: '#FF4500', // Orange Red
  'Campaign Group': '#FF4500', // Orange Red

  // Blue - Creative (statuses, names, rotation)
  Creatives: '#1E90FF', // Dodger Blue
  'Creative Selection': '#1E90FF', // Dodger Blue
  'Creative Rotation': '#1E90FF', // Dodger Blue
}

// Key mappings for differences
const keyMapping = {
  account: 'Account',
  associatedEntity: 'Associated Entity',
  audienceExpansionEnabled: 'Audience Expansion',
  campaignGroup: 'Campaign Group',
  costType: 'Cost Type',
  creativeSelection: 'Creative Selection',
  dailyBudget: 'Daily Budget',
  format: 'Format',
  id: 'ID',
  locale: 'Locale',
  name: 'Name',
  objectiveType: 'Objective Type',
  offsiteDeliveryEnabled: 'Offsite Delivery',
  offsitePreferences: 'Offsite Preferences',
  optimizationTargetType: 'Optimization Target Type',
  pacingStrategy: 'Pacing Strategy',
  runSchedule: 'Run Schedule',
  servingStatuses: 'Serving Statuses',
  status: 'Status',
  storyDeliveryEnabled: 'Story Delivery',
  targetingCriteria: 'Targeting Criteria',
  test: 'Test',
  type: 'Campaign Type',
  unitCost: 'Unit Cost',
  version: 'Version',
  creatives: 'Creatives'
}

const filterMapping = {
  budget: ['Daily Budget', 'Unit Cost', 'Cost Type', 'Pacing Strategy'],
  audience: ['Targeting Criteria', 'Audience Expansion'],
  objLocLang: ['Objective Type', 'Location', 'Language', 'Locale'],
  adType: ['Format', 'Ad Type', 'Campaign Type'],
  nameStatus: ['Status', 'Name', 'Campaign Group'],
  creatives: ['Creatives', 'Creative Selection', 'Creative Rotation']
};

export const metricMapping = {
  actionClicks: 'Action Clicks',
  adUnitClicks: 'Ad Unit Clicks',
  approximateMemberReach: 'Approximate Member Reach',
  cardClicks: 'Card Clicks',
  cardImpressions: 'Card Impressions',
  clicks: 'Clicks',
  commentLikes: 'Comment Likes',
  comments: 'Comments',
  companyPageClicks: 'Company Page Clicks',
  conversionValueInLocalCurrency: 'Conversion Value (Local Currency)',
  costInLocalCurrency: 'Cost (Local Currency)',
  costInUsd: 'Cost (USD)',
  costPerQualifiedLead: 'Cost Per Qualified Lead',
  documentCompletions: 'Document Completions',
  documentFirstQuartileCompletions: 'Document First Quartile Completions',
  documentMidpointCompletions: 'Document Midpoint Completions',
  documentThirdQuartileCompletions: 'Document Third Quartile Completions',
  downloadClicks: 'Download Clicks',
  externalWebsiteConversions: 'External Website Conversions',
  externalWebsitePostClickConversions: 'External Website Post-Click Conversions',
  externalWebsitePostViewConversions: 'External Website Post-View Conversions',
  follows: 'Follows',
  fullScreenPlays: 'Full Screen Plays',
  headlineClicks: 'Headline Clicks',
  headlineImpressions: 'Headline Impressions',
  impressions: 'Impressions',
  jobApplications: 'Job Applications',
  jobApplyClicks: 'Job Apply Clicks',
  landingPageClicks: 'Landing Page Clicks',
  leadGenerationMailContactInfoShares: 'Lead Generation Mail Contact Info Shares',
  leadGenerationMailInterestedClicks: 'Lead Generation Mail Interested Clicks',
  likes: 'Likes',
  oneClickLeadFormOpens: 'One-Click Lead Form Opens',
  oneClickLeads: 'One-Click Leads',
  opens: 'Opens',
  otherEngagements: 'Other Engagements',
  pivotValues: 'Pivot Values',
  postClickJobApplications: 'Post-Click Job Applications',
  postClickJobApplyClicks: 'Post-Click Job Apply Clicks',
  postClickRegistrations: 'Post-Click Registrations',
  postViewJobApplications: 'Post-View Job Applications',
  postViewJobApplyClicks: 'Post-View Job Apply Clicks',
  postViewRegistrations: 'Post-View Registrations',
  qualifiedLeads: 'Qualified Leads',
  reactions: 'Reactions',
  registrations: 'Registrations',
  sends: 'Sends',
  shares: 'Shares',
  talentLeads: 'Talent Leads',
  textUrlClicks: 'Text URL Clicks',
  totalEngagements: 'Total Engagements',
  validWorkEmailLeads: 'Valid Work Email Leads',
  videoCompletions: 'Video Completions',
  videoFirstQuartileCompletions: 'Video First Quartile Completions',
  videoMidpointCompletions: 'Video Midpoint Completions',
  videoStarts: 'Video Starts',
  videoThirdQuartileCompletions: 'Video Third Quartile Completions',
  videoViews: 'Video Views',
  viralCardClicks: 'Viral Card Clicks',
  viralCardImpressions: 'Viral Card Impressions',
  viralClicks: 'Viral Clicks',
  viralCommentLikes: 'Viral Comment Likes',
  viralComments: 'Viral Comments',
  viralCompanyPageClicks: 'Viral Company Page Clicks',
  viralDocumentCompletions: 'Viral Document Completions',
  viralDocumentFirstQuartileCompletions: 'Viral Document First Quartile Completions',
  viralDocumentMidpointCompletions: 'Viral Document Midpoint Completions',
  viralDocumentThirdQuartileCompletions: 'Viral Document Third Quartile Completions',
  viralDownloadClicks: 'Viral Download Clicks',
  viralExternalWebsiteConversions: 'Viral External Website Conversions',
  viralExternalWebsitePostClickConversions: 'Viral External Website Post-Click Conversions',
  viralExternalWebsitePostViewConversions: 'Viral External Website Post-View Conversions',
  viralFollows: 'Viral Follows',
  viralFullScreenPlays: 'Viral Full Screen Plays',
  viralImpressions: 'Viral Impressions',
  viralJobApplications: 'Viral Job Applications',
  viralJobApplyClicks: 'Viral Job Apply Clicks',
  viralLandingPageClicks: 'Viral Landing Page Clicks',
  viralLikes: 'Viral Likes',
  viralOneClickLeadFormOpens: 'Viral One-Click Lead Form Opens',
  viralOneClickLeads: 'Viral One-Click Leads',
  viralOtherEngagements: 'Viral Other Engagements',
  viralPostClickJobApplications: 'Viral Post-Click Job Applications',
  viralPostClickJobApplyClicks: 'Viral Post-Click Job Apply Clicks',
  viralPostClickRegistrations: 'Viral Post-Click Registrations',
  viralPostViewJobApplications: 'Viral Post-View Job Applications',
  viralPostViewJobApplyClicks: 'Viral Post-View Job Apply Clicks',
  viralPostViewRegistrations: 'Viral Post-View Registrations',
  viralReactions: 'Viral Reactions',
  viralRegistrations: 'Viral Registrations',
  viralShares: 'Viral Shares',
  viralTotalEngagements: 'Viral Total Engagements',
  viralVideoCompletions: 'Viral Video Completions',
  viralVideoFirstQuartileCompletions: 'Viral Video First Quartile Completions',
  viralVideoMidpointCompletions: 'Viral Video Midpoint Completions',
  viralVideoStarts: 'Viral Video Starts',
  viralVideoThirdQuartileCompletions: 'Viral Video Third Quartile Completions',
  viralVideoViews: 'Viral Video Views'
};

export { colorMapping, keyMapping, filterMapping }
