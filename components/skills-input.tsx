'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { X } from 'lucide-react';

interface SkillsInputProps {
  value: string[];
  onChange: (skills: string[]) => void;
  suggestions?: string[];
}

const DEFAULT_SUGGESTIONS = [
  // Frontend
  'React', 'Vue', 'Angular', 'TypeScript', 'JavaScript', 'HTML', 'CSS', 'Tailwind', 'Next.js', 'Redux',
  'Svelte', 'Nuxt.js', 'jQuery', 'Webpack', 'Vite', 'SASS', 'LESS', 'Bootstrap',
  'Material-UI', 'Ant Design', 'Chakra UI', 'Styled Components', 'Ember.js', 'Backbone.js',
  // Backend
  'Node.js', 'Python', 'Java', 'Go', 'Ruby', 'PHP', 'C#', '.NET', 'Express', 'Django',
  'Flask', 'FastAPI', 'Spring Boot', 'Laravel', 'Rails', 'ASP.NET', 'NestJS', 'Koa', 'Gin', 'Fiber',
  'Rust', 'Scala', 'Kotlin', 'Elixir', 'Phoenix', 'Haskell',
  // Databases
  'PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'DynamoDB', 'SQLite', 'MariaDB', 'Cassandra',
  'Elasticsearch', 'Neo4j', 'Oracle', 'SQL Server', 'CouchDB', 'Firebase', 'Supabase',
  // Cloud/DevOps
  'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'CI/CD', 'Jenkins', 'GitHub Actions',
  'Terraform', 'Ansible', 'GitLab CI', 'CircleCI', 'Travis CI', 'Heroku', 'Vercel', 'Netlify',
  'CloudFormation', 'Prometheus', 'Grafana', 'ELK Stack', 'Datadog', 'New Relic',
  // Mobile
  'React Native', 'Flutter', 'Swift', 'Kotlin', 'iOS', 'Android', 'Xamarin', 'Ionic',
  // Testing
  'Jest', 'Mocha', 'Chai', 'Cypress', 'Selenium', 'Playwright', 'JUnit', 'PyTest', 'TestNG',
  'Jasmine', 'Karma', 'Testing Library', 'Vitest',
  // Version Control & Collaboration
  'Git', 'GitHub', 'GitLab', 'Bitbucket', 'SVN', 'Mercurial',
  // API & Protocols
  'REST APIs', 'GraphQL', 'gRPC', 'WebSockets', 'SOAP', 'Microservices', 'API Gateway',
  // Data & Analytics
  'Pandas', 'NumPy', 'Scikit-learn', 'TensorFlow', 'PyTorch', 'Kafka', 'Spark', 'Hadoop',
  'Tableau', 'Power BI', 'D3.js', 'Chart.js',
  // Other
  'Agile', 'Scrum', 'Kanban', 'JIRA', 'Confluence', 'Linux', 'Unix', 'Shell Scripting',
  'Bash', 'PowerShell', 'Vim', 'VS Code', 'IntelliJ', 'OAuth', 'JWT', 'WebRTC', 'Socket.io'
];

export function SkillsInput({ value, onChange, suggestions = DEFAULT_SUGGESTIONS }: SkillsInputProps) {
  const [inputValue, setInputValue] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Compute filtered suggestions (derived state)
  const filteredSuggestions = useMemo(() => {
    if (!inputValue.trim()) return [];

    return suggestions
      .filter(
        (skill) =>
          skill.toLowerCase().includes(inputValue.toLowerCase()) &&
          !value.includes(skill)
      )
      .slice(0, 10);
  }, [inputValue, suggestions, value]);

  // Handle clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const addSkill = (skill: string) => {
    const trimmedSkill = skill.trim();
    if (trimmedSkill && !value.includes(trimmedSkill)) {
      onChange([...value, trimmedSkill]);
      setInputValue('');
      setHighlightedIndex(-1);
    }
  };

  const removeSkill = (skillToRemove: string) => {
    onChange(value.filter((skill) => skill !== skillToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (highlightedIndex >= 0 && filteredSuggestions[highlightedIndex]) {
        addSkill(filteredSuggestions[highlightedIndex]);
      } else if (inputValue.trim()) {
        addSkill(inputValue);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev < filteredSuggestions.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
      setHighlightedIndex(-1);
    } else if (e.key === 'Backspace' && !inputValue && value.length > 0) {
      removeSkill(value[value.length - 1]);
    }
  };

  return (
		<div ref={containerRef} className='relative'>
			{/* Input field */}
			<div className='min-h-10.5 flex flex-wrap gap-2 px-3 py-2 border border-input rounded-md focus-within:border-ring focus-within:ring-ring/50 focus-within:ring-[3px] bg-input/30'>
				{/* Selected skills as tags */}
				{value.map((skill) => (
					<span
						key={skill}
						className='inline-flex items-center gap-1 px-2 py-1 text-sm bg-primary text-primary-foreground rounded-md'
					>
						{skill}
						<button
							type='button'
							onClick={() => removeSkill(skill)}
							className='hover:bg-primary/80 rounded-full p-0.5 transition-colors'
							aria-label={`Remove ${skill}`}
						>
							<X className='w-3 h-3' />
						</button>
					</span>
				))}
				{/* Input */}
				<input
					ref={inputRef}
					type='text'
					value={inputValue}
					onChange={(e) => setInputValue(e.target.value)}
					onKeyDown={handleKeyDown}
					onFocus={() => setShowSuggestions(true)}
					placeholder={value.length === 0 ? "Type to search or add skills..." : ""}
					className='flex-1 min-w-50 outline-none text-sm bg-transparent placeholder:text-muted-foreground'
				/>
			</div>

			{/* Suggestions dropdown - positioned absolutely below the input with high z-index */}
			{showSuggestions && filteredSuggestions.length > 0 && (
				<div className='absolute left-0 right-0 mt-1 bg-popover border border-border rounded-md shadow-lg max-h-60 overflow-auto z-[100]'>
					{filteredSuggestions.map((skill: string, index: number) => (
						<button
							key={skill}
							type='button'
							onClick={() => addSkill(skill)}
							className={`w-full text-left px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground ${
								index === highlightedIndex ? "bg-accent text-accent-foreground" : ""
							}`}
						>
							{skill}
						</button>
					))}
				</div>
			)}
		</div>
	);
}
