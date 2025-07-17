import React, { useCallback } from 'react';

const SubjectPrompting = ({ subject }) => {
  const getSubjectData = useCallback(() => {
    switch (subject) {
      case 'Mathematics':
        return {
          icon: '📐',
          title: 'Mathematics Learning Enhancement',
          description: 'Applying advanced mathematical pedagogical techniques',
          techniques: [
            'Problem-solving strategies and logical thinking',
            'Visual representations and graphical understanding',
            'Real-world applications of mathematical concepts',
            'Step-by-step procedural learning',
            'Mathematical reasoning and proof techniques'
          ],
          benefits: [
            'Better problem-solving skills',
            'Enhanced logical thinking',
            'Improved mathematical confidence',
            'Better exam preparation'
          ],
          suggestedPrompt: 'Break down complex mathematical concepts using visual aids, real-world examples, and step-by-step problem-solving approaches suitable for the target audience.'
        };
      case 'Science':
        return {
          icon: '🔬',
          title: 'Scientific Inquiry Methods',
          description: 'Implementing inquiry-based learning for scientific understanding',
          techniques: [
            'Hypothesis formation and testing',
            'Experimental design and observation',
            'Scientific method application',
            'Evidence-based reasoning',
            'Connecting theory to practical experiments'
          ],
          benefits: [
            'Enhanced critical thinking',
            'Better scientific reasoning',
            'Improved research skills',
            'Deeper understanding of concepts'
          ],
          suggestedPrompt: 'Present scientific concepts through hands-on experiments, observations, and inquiry-based learning that encourages hypothesis testing and critical thinking.'
        };
      case 'Physics':
        return {
          icon: '⚡',
          title: 'Physics Conceptual Learning',
          description: 'Mastering physics through conceptual understanding and real-world applications',
          techniques: [
            'Conceptual problem-solving over formula memorization',
            'Real-world physics phenomena demonstrations',
            'Interactive simulations and visual models',
            'Mathematical modeling of physical systems',
            'Experimental verification of theoretical concepts'
          ],
          benefits: [
            'Better understanding of natural phenomena',
            'Enhanced analytical thinking',
            'Improved problem-solving abilities',
            'Better exam performance'
          ],
          suggestedPrompt: 'Explain physics concepts through real-world phenomena, interactive demonstrations, and conceptual understanding rather than rote formula memorization, connecting abstract theories to tangible experiences.'
        };
      case 'Chemistry':
        return {
          icon: '🧪',
          title: 'Chemistry Process Learning',
          description: 'Understanding chemical processes through experimentation and molecular thinking',
          techniques: [
            'Molecular-level visualization of reactions',
            'Laboratory safety and experimental design',
            'Chemical equation balancing strategies',
            'Real-world applications of chemical principles',
            'Process-oriented learning approach'
          ],
          benefits: [
            'Better understanding of chemical processes',
            'Enhanced laboratory skills',
            'Improved safety awareness',
            'Better exam preparation'
          ],
          suggestedPrompt: 'Teach chemistry through molecular visualization, safe experimental practices, and real-world applications, emphasizing process understanding over memorization of formulas and reactions.'
        };
      case 'History':
        return {
          icon: '📜',
          title: 'Historical Context Building',
          description: 'Developing historical thinking and chronological understanding',
          techniques: [
            'Chronological thinking and sequencing',
            'Cause and effect relationships',
            'Multiple perspectives analysis',
            'Primary source interpretation',
            'Historical empathy and context understanding'
          ],
          benefits: [
            'Better understanding of historical context',
            'Enhanced critical thinking',
            'Improved analytical skills',
            'Better exam preparation'
          ],
          suggestedPrompt: 'Present historical events through multiple perspectives, emphasizing cause-and-effect relationships, and connecting past events to contemporary issues.'
        };
      case 'Literature':
        return {
          icon: '📖',
          title: 'Literary Analysis Framework',
          description: 'Developing critical reading and analytical skills',
          techniques: [
            'Theme identification and analysis',
            'Character development understanding',
            'Literary device recognition',
            'Contextual interpretation',
            'Creative expression and personal response'
          ],
          benefits: [
            'Enhanced reading comprehension',
            'Better analytical writing',
            'Improved critical thinking',
            'Deeper understanding of texts'
          ],
          suggestedPrompt: 'Analyze literary works through character development, thematic elements, and literary devices while encouraging personal connections and creative responses.'
        };
      case 'Accounting & Finance':
        return {
          icon: '💰',
          title: 'Financial Literacy Education',
          description: 'Building practical financial and accounting skills',
          techniques: [
            'Real-world financial scenarios and case studies',
            'Practical application of accounting principles',
            'Decision-making with financial data analysis',
            'Ethical considerations in financial practices',
            'Technology integration in modern accounting',
            'Investment and budgeting strategies'
          ],
          benefits: [
            'Better financial decision-making',
            'Enhanced analytical skills',
            'Improved business understanding',
            'Better career preparation'
          ],
          suggestedPrompt: 'Teach financial and accounting principles through real-world business scenarios, case studies, and practical applications, emphasizing ethical decision-making and modern financial practices.'
        };
      default:
        return {
          icon: '📚',
          title: 'Subject Selection',
          description: 'Choose a subject for personalized pedagogical approach',
          techniques: [],
          benefits: [],
          suggestedPrompt: 'Select a subject to get personalized content with subject-specific pedagogical techniques.'
        };
    }
  }, [subject]);

  const subjectData = getSubjectData();

  return (
    <div className="relative p-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-200 dark:border-blue-800 shadow-lg">
      {/* PRO Tag */}
      <div className="absolute top-4 right-4 bg-gradient-to-r from-purple-500 to-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
        PRO
      </div>

      <div className="flex items-center mb-4">
        <div className="bg-blue-100 dark:bg-blue-900/40 rounded-full p-3 mr-4">
          <span className="text-2xl">{subjectData.icon}</span>
        </div>
        <div>
          <h2 className="text-xl font-bold text-blue-900 dark:text-blue-100 mb-1">
            {subjectData.title}
          </h2>
          <p className="text-sm text-blue-700 dark:text-blue-300">
            {subjectData.description}
          </p>
        </div>
      </div>


      {/* Benefits Section */}
      {subjectData.benefits.length > 0 && (
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">Key Benefits:</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {subjectData.benefits.map((benefit, index) => (
              <div key={index} className="flex items-center bg-green-50 dark:bg-green-900/20 p-2 rounded-lg">
                <span className="text-green-600 dark:text-green-400 mr-2">✓</span>
                <span className="text-green-800 dark:text-green-200 text-sm font-medium">{benefit}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-blue-100 dark:bg-blue-900/40 rounded-lg p-4">
        <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">AI Enhancement:</h4>
        <p className="text-sm text-blue-800 dark:text-blue-200">
          Subject-specific prompting automatically applied for enhanced learning outcomes
        </p>
      </div>
    </div>
  );
};

export default SubjectPrompting;

