import { 
  Calculator, 
  Beaker, 
  Atom, 
  Zap, 
  Clock, 
  BookOpen, 
  DollarSign, 
  MessageCircle 
} from 'lucide-react';

export const subjects = [
  'General', 
  'Accounting & Finance', 
  'Mathematics', 
  'Science', 
  'Physics', 
  'Chemistry', 
  'History', 
  'Literature'
];

export const subjectConfig = {
  'General': {
    icon: MessageCircle,
    color: 'text-gray-600 dark:text-gray-400',
    bgColor: 'bg-gray-100 dark:bg-gray-700',
    description: 'General discussions and topics'
  },
  'Accounting & Finance': {
    icon: DollarSign,
    color: 'text-green-600 dark:text-green-400',
    bgColor: 'bg-green-100 dark:bg-green-900/20',
    description: 'Financial literacy and business cognition'
  },
  'Mathematics': {
    icon: Calculator,
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-100 dark:bg-blue-900/20',
    description: 'Mathematical concepts and problem solving'
  },
  'Science': {
    icon: Beaker,
    color: 'text-purple-600 dark:text-purple-400',
    bgColor: 'bg-purple-100 dark:bg-purple-900/20',
    description: 'Scientific inquiry and research'
  },
  'Physics': {
    icon: Atom,
    color: 'text-indigo-600 dark:text-indigo-400',
    bgColor: 'bg-indigo-100 dark:bg-indigo-900/20',
    description: 'Physics concepts and applications'
  },
  'Chemistry': {
    icon: Zap,
    color: 'text-yellow-600 dark:text-yellow-400',
    bgColor: 'bg-yellow-100 dark:bg-yellow-900/20',
    description: 'Chemical processes and molecular science'
  },
  'History': {
    icon: Clock,
    color: 'text-orange-600 dark:text-orange-400',
    bgColor: 'bg-orange-100 dark:bg-orange-900/20',
    description: 'Historical events and analysis'
  },
  'Literature': {
    icon: BookOpen,
    color: 'text-pink-600 dark:text-pink-400',
    bgColor: 'bg-pink-100 dark:bg-pink-900/20',
    description: 'Literary analysis and creative writing'
  }
};

export const getSubjectIcon = (subject) => {
  const config = subjectConfig[subject];
  if (!config) return subjectConfig['General'];
  return config;
};

export const getSubjectColor = (subject) => {
  const config = subjectConfig[subject];
  return config ? config.color : subjectConfig['General'].color;
};

export const getSubjectBgColor = (subject) => {
  const config = subjectConfig[subject];
  return config ? config.bgColor : subjectConfig['General'].bgColor;
};
