// Color mappings for displaying changes
export const colorMapping = {
  // Green - Budgets, bids, cost caps, spend type (daily/lifetime)
  'Daily Budget': '#6A9A1F', // Earthy Green
  'Unit Cost': '#6A9A1F', // Earthy Green
  'Cost Type': '#6A9A1F', // Earthy Green
  'Pacing Strategy': '#6A9A1F', // Earthy Green

  // Yellow - Audience targeting
  'Targeting Criteria': '#F4C430', // Warm Yellow
  'Audience Expansion': '#F4C430', // Warm Yellow
  
  // Purple - Objective, location, and language
  'Objective Type': '#8A2BE2', // Deep Purple
  'Location': '#8A2BE2', // Deep Purple
  'Language': '#8A2BE2', // Deep Purple
  Locale: '#8A2BE2', // Deep Purple

  // Light Blue - Ad type
  Format: '#154360', // Lighter Sky Blue
  'Ad Type': '#154360', // Lighter Sky Blue
  'Campaign Type': '#154360', // Lighter Sky Blue

  // Darker Blue - Creative (statuses, names, rotation)
  Creatives: '#5DADE2', // Dark Navy Blue
  'Creative Selection': '#5DADE2', // Dark Navy Blue
  'Creative Rotation': '#5DADE2', // Dark Navy Blue

  // Red - Status/name changes (campaign group & campaign levels only)
  Status: '#D32F2F', // Crimson Red
  Name: '#D32F2F', // Crimson Red
  'Campaign Group': '#D32F2F', // Crimson Red
}

// Key mappings for differences
export const keyMapping = {
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
  creatives: 'Creatives',
  campaignAdded: 'Campaign Added'
}

export const metricMapping = {
  actionClicks: 'Action Clicks',
  adUnitClicks: 'Ad Unit Clicks',
  approximateMemberReach: 'Approximate Member Reach',
  cardClicks: 'Card Clicks',
  cardImpressions: 'Card Impressions',
  clicks: 'Clicks',
  clickThroughRate: 'Click-Through Rate',
  commentLikes: 'Comment Likes',
  comments: 'Comments',
  companyPageClicks: 'Company Page Clicks',
  conversionValueInLocalCurrency: 'Conversion Value (Local Currency)',
  costInLocalCurrency: 'Cost (Local Currency)',
  costInUsd: 'Cost (USD)',
  costPerQualifiedLead: 'Cost Per Qualified Lead',
  costPerClick: 'Cost Per Click',
  costPerThousandImpressions: 'Cost Per Thousand Impressions (CPM)',
  costPerConversion: 'Cost Per Conversion (CPCV)',
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
