import {
  Bell,
  BriefcaseBusiness,
  FileText,
  Search,
  Send,
  ShieldCheck,
  UserRound,
  Users,
} from 'lucide-react';

export const dashboardConfig = {
  JOB_SEEKER: {
    eyebrow: 'Job seeker workspace',
    subtitle: 'Track your search, applications, and career profile from one place.',
    stats(data) {
      return [
        { label: 'Applications', value: data?.applications || 0, icon: Send },
        { label: 'Active alerts', value: data?.jobAlerts || 0, icon: Bell },
        { label: 'Profile status', value: 'Ready', icon: UserRound },
      ];
    },
    actions: [
      { label: 'Explore jobs', description: 'Browse open opportunities', to: '/jobs', icon: Search },
      { label: 'Update resume', description: 'Keep your profile application-ready', to: '/resume', icon: FileText },
      { label: 'Manage alerts', description: 'Review saved job searches', to: '/alerts', icon: Bell },
    ],
  },
  EMPLOYER: {
    eyebrow: 'Employer workspace',
    subtitle: 'Monitor your active roles and the candidates interested in your company.',
    stats(data) {
      return [
        { label: 'Job posts', value: data?.jobs || 0, icon: BriefcaseBusiness },
        { label: 'Applications', value: data?.applications || 0, icon: Users },
        { label: 'Publishing', value: 'Enabled', icon: ShieldCheck },
      ];
    },
    actions: [
      { label: 'Manage jobs', description: 'Create and update job posts', to: '/employer/jobs', icon: BriefcaseBusiness },
      { label: 'Review candidates', description: 'Move applicants through the pipeline', to: '/employer/candidates', icon: Users },
    ],
  },
  ADMIN: {
    eyebrow: 'Administration workspace',
    subtitle: 'Monitor platform activity, user access, employer approvals, and marketplace health.',
    stats(data) {
      return [
        { label: 'Total users', value: data?.users || 0, icon: Users },
        { label: 'Open jobs', value: data?.openJobs || 0, icon: BriefcaseBusiness },
        { label: 'Applications', value: data?.applications || 0, icon: Send },
        { label: 'Pending employers', value: data?.pendingEmployers || 0, icon: ShieldCheck },
      ];
    },
    actions: [
      { label: 'Open administration', description: 'Manage users and employer approvals', to: '/admin', icon: ShieldCheck },
    ],
  },
};
