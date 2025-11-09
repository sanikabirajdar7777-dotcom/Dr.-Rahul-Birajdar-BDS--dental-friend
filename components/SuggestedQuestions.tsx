import React from 'react';

interface SuggestedQuestionsProps {
  questions: string[];
  onQuestionClick: (question: string) => void;
}

const SuggestedQuestions: React.FC<SuggestedQuestionsProps> = ({ questions, onQuestionClick }) => {
  return (
    <div className="flex justify-start">
      {/* This div is to align with the doctor's icon and message bubble */}
      <div className="flex items-start gap-3 max-w-xl w-full">
        {/* Spacer to align with the doctor icon's width */}
        <div className="w-9 h-9 flex-shrink-0"></div>
        <div className="flex flex-col items-start space-y-2 mt-2">
          <p className="text-sm text-gray-400 font-medium">Try asking:</p>
          <div className="flex flex-wrap gap-2">
            {questions.map((question, i) => (
              <button
                key={i}
                onClick={() => onQuestionClick(question)}
                className="text-sm text-purple-300 bg-gray-800 border border-gray-700 rounded-full px-4 py-2 hover:bg-gray-700 hover:border-purple-500 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                {question}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuggestedQuestions;
