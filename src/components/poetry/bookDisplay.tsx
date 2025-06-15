// src/components/BookDisplay.tsx
import React from 'react';
import { Book, Example, Formula, Rule, CommonError } from '@/types/educational.types';
import { Calculator, BookOpen, Beaker } from 'lucide-react';

// Icon mapping for categories
const categoryIcons = {
  math: Calculator,
  english: BookOpen,
  science: Beaker,
};

// Component for displaying examples in a structured way
export function ExampleTable({ examples }: { examples: Example[] }) {
  return (
    <div className="space-y-4">
      {examples.map((example, index) => (
        <div key={example.id || index} className="bg-gray-50 rounded-lg p-4">
          <div className="flex justify-between items-start mb-2">
            <code className="text-lg font-mono bg-white px-3 py-1 rounded">
              {example.expression}
            </code>
            {example.solution && (
              <span className="text-green-600 font-semibold">
                = {example.solution}
              </span>
            )}
          </div>
          {example.steps && (
            <div className="mt-3 space-y-1">
              {example.steps.map((step, stepIndex) => (
                <div key={stepIndex} className="flex items-center text-sm">
                  <span className="text-gray-500 mr-2">Step {stepIndex + 1}:</span>
                  <code className="font-mono bg-white px-2 py-0.5 rounded">
                    {step}
                  </code>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// Component for displaying formulas
export function FormulaCard({ formula }: { formula: Formula }) {
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <div className="flex justify-between items-start">
        <div>
          <h4 className="font-semibold text-blue-900">{formula.name}</h4>
          <code className="text-xl font-mono mt-2 block">{formula.symbol}</code>
        </div>
        {formula.units && (
          <span className="text-sm text-blue-700 bg-blue-100 px-2 py-1 rounded">
            {formula.units}
          </span>
        )}
      </div>
      {formula.description && (
        <p className="text-sm text-gray-600 mt-2">{formula.description}</p>
      )}
    </div>
  );
}

// Component for displaying rules
export function RulesList({ rules }: { rules: Rule[] }) {
  return (
    <div className="space-y-3">
      {rules.map((rule, index) => (
        <div key={rule.id || index} className="border-l-4 border-purple-400 pl-4">
          <h4 className="font-semibold text-purple-900">{rule.name}</h4>
          <p className="text-gray-700 mt-1">{rule.statement}</p>
          {rule.symbol && (
            <code className="text-sm font-mono bg-purple-50 px-2 py-1 rounded mt-2 inline-block">
              {rule.symbol}
            </code>
          )}
          {rule.exceptions && (
            <div className="mt-2 text-sm text-orange-700">
              <span className="font-semibold">Exceptions:</span>
              <ul className="list-disc list-inside ml-2">
                {rule.exceptions.map((exception, i) => (
                  <li key={i}>{exception}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// Component for displaying common errors
export function CommonErrorsTable({ errors }: { errors: CommonError[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-red-50">
          <tr>
            <th className="px-4 py-2 text-left text-xs font-medium text-red-900 uppercase tracking-wider">
              ❌ Common Error
            </th>
            <th className="px-4 py-2 text-left text-xs font-medium text-green-900 uppercase tracking-wider">
              ✓ Correct
            </th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
              Explanation
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {errors.map((error, index) => (
            <tr key={error.id || index}>
              <td className="px-4 py-3 text-sm">
                <code className="font-mono bg-red-50 px-2 py-1 rounded line-through">
                  {error.error}
                </code>
              </td>
              <td className="px-4 py-3 text-sm">
                <code className="font-mono bg-green-50 px-2 py-1 rounded">
                  {error.correct}
                </code>
              </td>
              <td className="px-4 py-3 text-sm text-gray-600">
                {error.explanation}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Main book content display component
export function BookContentDisplay({ book }: { book: Book }) {
  const Icon = categoryIcons[book.mainCategory];
  
  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center mb-4">
          <Icon size={32} className="mr-3" style={{ color: book.colors.primary }} />
          <div>
            <h1 className="text-3xl font-bold" style={{ color: book.colors.primary }}>
              {book.title}
            </h1>
            {book.subtitle && (
              <p className="text-gray-600">{book.subtitle}</p>
            )}
          </div>
        </div>
        <div className="flex space-x-4 text-sm">
          <span className="bg-gray-100 px-3 py-1 rounded-full">
            {book.mainCategory.toUpperCase()}
          </span>
          <span className="bg-gray-100 px-3 py-1 rounded-full">
            {book.subCategory.toUpperCase()}
          </span>
          {book.scientificDiscipline && (
            <span className="bg-gray-100 px-3 py-1 rounded-full">
              {book.scientificDiscipline.toUpperCase()}
            </span>
          )}
        </div>
      </div>

      {/* Learning Content */}
      <div className="space-y-12">
        {/* Math Concepts */}
        {book.learningContent.mathConcepts?.map((concept) => (
          <section key={concept.id} className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">{concept.topic}</h2>
            
            {concept.formula && (
              <FormulaCard formula={concept.formula} />
            )}
            
            {concept.rules.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-3">Rules & Methods</h3>
                <RulesList rules={concept.rules} />
              </div>
            )}
            
            {concept.examples.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-3">Examples</h3>
                <ExampleTable examples={concept.examples} />
              </div>
            )}
            
            {concept.strategies && concept.strategies.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-3">Strategies</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  {concept.strategies.map((strategy, index) => (
                    <div key={strategy.id || index} className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <h4 className="font-semibold text-yellow-900">{strategy.title}</h4>
                      <p className="text-sm text-gray-700 mt-1">{strategy.description}</p>
                      {strategy.whenToUse && (
                        <p className="text-xs text-yellow-700 mt-2">
                          <span className="font-semibold">When to use:</span> {strategy.whenToUse}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {concept.commonErrors && concept.commonErrors.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-3">Common Errors</h3>
                <CommonErrorsTable errors={concept.commonErrors} />
              </div>
            )}
            
            {concept.difficultyLevels && (
              <div>
                <h3 className="text-lg font-semibold mb-3">Practice by Difficulty</h3>
                <div className="space-y-4">
                  {Object.entries(concept.difficultyLevels).map(([level, content]) => (
                    <details key={level} className="border border-gray-200 rounded-lg">
                      <summary className="px-4 py-3 cursor-pointer hover:bg-gray-50 flex justify-between items-center">
                        <span className="font-medium capitalize">{level} Level</span>
                        <span className="text-sm text-gray-600">{content.description}</span>
                      </summary>
                      <div className="px-4 py-3 bg-gray-50">
                        <ExampleTable examples={content.examples} />
                        {content.practiceProblems && (
                          <div className="mt-4">
                            <h5 className="font-semibold text-sm mb-2">Practice Problems:</h5>
                            <div className="flex flex-wrap gap-2">
                              {content.practiceProblems.map((problem, i) => (
                                <code key={i} className="bg-white px-2 py-1 rounded text-sm">
                                  {problem}
                                </code>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </details>
                  ))}
                </div>
              </div>
            )}
          </section>
        ))} 
      </div>
    </div>
  );
}