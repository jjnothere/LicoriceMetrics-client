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

export const metricFolders = {
  'Clicks & Impressions': [
    'impressions',
    'clicks',
    'adUnitClicks',
    'cardClicks',
    'cardImpressions',
    'headlineClicks',
    'headlineImpressions',
    'textUrlClicks'
  ],
  'Cost & Efficiency': [
    'costInLocalCurrency',
    'costInUsd',
    'costPerClick',
    'costPerThousandImpressions',
    'costPerThousandUniqueUsers',
    'costPerQualifiedLead'
  ],
  'Conversions & Leads': [
    'conversionValueInLocalCurrency',
    'externalWebsiteConversions',
    'externalWebsitePostClickConversions',
    'externalWebsitePostViewConversions',
    'oneClickLeads',
    'oneClickLeadFormOpens',
    'landingPageClicks',
    'jobApplications',
    'jobApplyClicks',
    'postClickRegistrations',
    'postViewRegistrations',
    'qualifiedLeads',
    'leadGenerationMailInterestedClicks',
    'leadGenerationMailContactInfoShares'
  ],
  'Engagement & Social': [
    'likes',
    'comments',
    'commentLikes',
    'shares',
    'reactions',
    'follows',
    'otherEngagements',
    'totalEngagements',
    'approximateMemberReach'
  ],
  'Video Performance': [
    'videoStarts',
    'videoFirstQuartileCompletions',
    'videoMidpointCompletions',
    'videoThirdQuartileCompletions',
    'videoCompletions',
    'videoViews',
    'fullScreenPlays'
  ],
  'Document & Content': [
    'documentFirstQuartileCompletions',
    'documentMidpointCompletions',
    'documentThirdQuartileCompletions',
    'documentCompletions'
  ],
  'Job-Specific Metrics': [
    'jobApplications',
    'jobApplyClicks',
    'postClickJobApplications',
    'postViewJobApplications'
  ],
  'Viral Metrics': [
    'viralClicks',
    'viralImpressions',
    'viralCardClicks',
    'viralCardImpressions',
    'viralComments',
    'viralCommentLikes',
    'viralCompanyPageClicks',
    'viralDocumentCompletions',
    'viralDocumentFirstQuartileCompletions',
    'viralDocumentMidpointCompletions',
    'viralDocumentThirdQuartileCompletions',
    'viralDownloadClicks',
    'viralExternalWebsiteConversions',
    'viralExternalWebsitePostClickConversions',
    'viralExternalWebsitePostViewConversions',
    'viralFollows',
    'viralFullScreenPlays',
    'viralJobApplications',
    'viralJobApplyClicks',
    'viralLandingPageClicks',
    'viralLikes',
    'viralOneClickLeadFormOpens',
    'viralOneClickLeads',
    'viralOtherEngagements',
    'viralPostClickJobApplications',
    'viralPostClickJobApplyClicks',
    'viralPostClickRegistrations',
    'viralPostViewJobApplications',
    'viralPostViewJobApplyClicks',
    'viralPostViewRegistrations',
    'viralReactions',
    'viralRegistrations',
    'viralShares',
    'viralTotalEngagements',
    'viralVideoCompletions',
    'viralVideoFirstQuartileCompletions',
    'viralVideoMidpointCompletions',
    'viralVideoStarts',
    'viralVideoThirdQuartileCompletions',
    'viralVideoViews'
  ]
};

export const metricMapping = {
  impressions: 'Impressions',
  clicks: 'Clicks',
  adUnitClicks: 'Ad Unit Clicks',
  cardClicks: 'Card Clicks',
  cardImpressions: 'Card Impressions',
  headlineClicks: 'Headline Clicks',
  headlineImpressions: 'Headline Impressions',
  textUrlClicks: 'Text URL Clicks',
  costInLocalCurrency: 'Cost (Local Currency)',
  costInUsd: 'Cost (USD)',
  costPerClick: 'Cost Per Click',
  costPerThousandImpressions: 'Cost Per Thousand Impressions',
  costPerThousandUniqueUsers: 'Cost Per Thousand Unique Users',
  costPerQualifiedLead: 'Cost Per Qualified Lead',
  conversionValueInLocalCurrency: 'Conversion Value (Local Currency)',
  externalWebsiteConversions: 'External Website Conversions',
  externalWebsitePostClickConversions: 'External Website Post-Click Conversions',
  externalWebsitePostViewConversions: 'External Website Post-View Conversions',
  oneClickLeads: 'One-Click Leads',
  oneClickLeadFormOpens: 'One-Click Lead Form Opens',
  landingPageClicks: 'Landing Page Clicks',
  jobApplications: 'Job Applications',
  jobApplyClicks: 'Job Apply Clicks',
  postClickRegistrations: 'Post-Click Registrations',
  postViewRegistrations: 'Post-View Registrations',
  qualifiedLeads: 'Qualified Leads',
  leadGenerationMailInterestedClicks: 'Lead Generation Mail Interested Clicks',
  leadGenerationMailContactInfoShares: 'Lead Generation Mail Contact Info Shares',
  likes: 'Likes',
  comments: 'Comments',
  commentLikes: 'Comment Likes',
  shares: 'Shares',
  reactions: 'Reactions',
  follows: 'Follows',
  otherEngagements: 'Other Engagements',
  totalEngagements: 'Total Engagements',
  approximateMemberReach: 'Approximate Member Reach',
  videoStarts: 'Video Starts',
  videoFirstQuartileCompletions: 'Video First Quartile Completions',
  videoMidpointCompletions: 'Video Midpoint Completions',
  videoThirdQuartileCompletions: 'Video Third Quartile Completions',
  videoCompletions: 'Video Completions',
  videoViews: 'Video Views',
  fullScreenPlays: 'Full Screen Plays',
  documentFirstQuartileCompletions: 'Document First Quartile Completions',
  documentMidpointCompletions: 'Document Midpoint Completions',
  documentThirdQuartileCompletions: 'Document Third Quartile Completions',
  documentCompletions: 'Document Completions',
  postClickJobApplications: 'Post-Click Job Applications',
  postViewJobApplications: 'Post-View Job Applications',
  viralClicks: 'Viral Clicks',
  viralImpressions: 'Viral Impressions',
  viralCardClicks: 'Viral Card Clicks',
  viralCardImpressions: 'Viral Card Impressions',
  viralComments: 'Viral Comments',
  viralCommentLikes: 'Viral Comment Likes',
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
