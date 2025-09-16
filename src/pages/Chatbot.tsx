import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

interface ChatMessage {
  id: string;
  role: "user" | "bot";
  content: string;
}

// ────────────────────────────────────────────────────────────
// Organized by weighting method with detailed calculation methods
// ────────────────────────────────────────────────────────────
const weightingMethodsQA = {
  general: [
    {
      q: "What is statistical weighting?",
      a: "Statistical weighting assigns different importance values to observations to correct sampling biases or reflect different data importance in overall indicators. It ensures your sample better represents the target population."
    },
    {
      q: "Why is weighting important in surveys?",
      a: "Weighting is crucial because:\n• Corrects for unequal selection probabilities\n• Adjusts for non-response biases\n• Makes samples representative of populations\n• Improves accuracy of estimates and predictions"
    },
    {
      q: "What are the main weighting methods?",
      a: "Main methods include:\n• Post-stratification: For single variable adjustment\n• Raking (IPF): For multiple variables simultaneously\n• Regression weighting: Using predictive models\n• Propensity score weighting: For treatment effect estimation"
    }
  ],
  postStratification: [
    {
      q: "What is post-stratification weighting?",
      a: "Post-stratification is a weighting method where you adjust your sample to match known population proportions for one key variable. It's ideal when you have reliable population data for a single important demographic variable like age, gender, or region."
    },
    {
      q: "When should I use post-stratification?",
      a: "Use post-stratification when:\n• You have accurate population data for ONE key variable\n• Your sample is large enough within each stratum\n• The variable strongly correlates with your outcomes\n• You need simple, transparent weighting"
    },
    {
      q: "What are the limitations of post-stratification?",
      a: "Limitations include:\n• Only adjusts for one variable at a time\n• Requires accurate population data\n• Can create extreme weights if strata are small\n• Doesn't handle multiple demographic adjustments"
    },
    {
      q: "How is post-stratification calculated?",
      a: "CALCULATION METHOD:\n\n1. For each category i in your variable:\n   Weight_i = (Population_%_i) / (Sample_%_i)\n\n2. Example: If population has 50% women but sample has 40%:\n   Weight_women = 0.50 / 0.40 = 1.25\n   Weight_men = 0.50 / 0.60 = 0.83\n\n3. Normalize weights so average weight = 1\n4. Apply weights to each observation in the category"
    },
    {
      q: "What is the mathematical formula?",
      a: "MATHEMATICAL FORMULA:\n\nw_i = (N_population_i / N_population_total) / (n_sample_i / n_sample_total)\n\nWhere:\n• w_i = weight for category i\n• N_population_i = population count in category i\n• N_population_total = total population\n• n_sample_i = sample count in category i\n• n_sample_total = total sample size"
    },
    {
      q: "Can you show a complete example?",
      a: "COMPLETE EXAMPLE:\n\nPopulation distribution:\n• Women: 50% (500/1000)\n• Men: 50% (500/1000)\n\nSample distribution:\n• Women: 40% (40/100)\n• Men: 60% (60/100)\n\nWeight calculation:\n• Weight_women = 0.50 / 0.40 = 1.25\n• Weight_men = 0.50 / 0.60 = 0.833\n\nNormalized weights (average = 1):\n• Women: 1.25 × (100/125) = 1.00\n• Men: 0.833 × (100/125) = 0.667\n\nEach woman gets weight 1.00, each man gets weight 0.667"
    }
  ],
  raking: [
    {
      q: "What is raking (IPF) weighting?",
      a: "Raking (Iterative Proportional Fitting) is a multi-variable weighting method that adjusts your sample to match multiple population margins simultaneously. It iteratively adjusts weights until the sample matches all target distributions."
    },
    {
      q: "When should I use raking?",
      a: "Use raking when:\n• You need to adjust for 2-3 variables simultaneously\n• You have population margins for multiple variables\n• Your variables are moderately correlated\n• You want more comprehensive adjustment than single-variable methods"
    },
    {
      q: "What are raking best practices?",
      a: "Best practices:\n• Limit to 2-3 variables maximum\n• Choose variables with known population data\n• Avoid highly correlated variables\n• Check for extreme weights and trim if necessary\n• Monitor convergence (usually 10-30 iterations)"
    },
    {
      q: "How does the raking algorithm work?",
      a: "RAKING ALGORITHM STEPS:\n\n1. Start with initial weights (usually all 1)\n2. For each variable, adjust weights to match population margins\n3. Iterate through all variables repeatedly\n4. Stop when weights converge (changes become minimal)\n\nIteration example:\n• Adjust for age distribution\n• Then adjust for gender distribution\n• Then adjust for region distribution\n• Repeat until all margins match within tolerance"
    },
    {
      q: "What is the mathematical process?",
      a: "MATHEMATICAL PROCESS:\n\nFor each iteration and each variable j:\n\nw_new = w_old × (Target_j / Current_j)\n\nWhere:\n• w_old = current weight\n• Target_j = target proportion for category j\n• Current_j = current weighted proportion for category j\n\nAfter each variable adjustment, weights are normalized.\nThe process repeats until convergence criteria are met."
    },
    {
      q: "Can you show a raking example?",
      a: "RAKING EXAMPLE:\n\nTargets:\n• Gender: Women 50%, Men 50%\n• Age: Young 30%, Middle 40%, Senior 30%\n\nStep 1: Adjust for gender\n• If sample has 40% women, 60% men:\n  Women: weight × (0.50/0.40) = weight × 1.25\n  Men: weight × (0.50/0.60) = weight × 0.833\n\nStep 2: Adjust for age with new weights\n• Recalculate age distribution with current weights\n• Apply similar adjustment factors\n\nStep 3: Repeat until both gender and age match targets within 0.1%"
    },
    {
      q: "What is convergence in raking?",
      a: "CONVERGENCE CRITERIA:\n\nRaking stops when:\n• Maximum absolute difference between target and current proportions is below tolerance (e.g., 0.001)\n• Or maximum number of iterations reached (e.g., 50)\n\nTypical convergence:\n• 5-20 iterations for 2 variables\n• 10-30 iterations for 3 variables\n• More iterations needed for highly correlated variables"
    },
    {
      q: "How to handle extreme weights?",
      a: "HANDLING EXTREME WEIGHTS:\n\n1. Weight trimming: Cap weights at certain percentiles\n   Example: Trim weights above 95th percentile\n\n2. Weight smoothing: Apply mathematical smoothing\n\n3. Variable selection: Choose less correlated variables\n\n4. Iteration control: Limit maximum iterations\n\nRecommended: Trim weights to 0.1-10 range for stability"
    }
  ],
  comparison: [
    {
      q: "Post-stratification vs Raking: which to choose?",
      a: "CHOICE GUIDE:\n\nChoose POST-STRATIFICATION when:\n• You have one key demographic variable\n• Population data is very reliable\n• Sample sizes per category are sufficient\n• Simplicity and transparency are important\n\nChoose RAKING when:\n• You need to adjust for 2-3 variables\n• Variables have known population margins\n• You want more comprehensive adjustment\n• Sample can support multi-dimensional adjustment"
    },
    {
      q: "What are the advantages of each method?",
      a: "ADVANTAGES:\n\nPOST-STRATIFICATION:\n• Simple to implement and explain\n• Computationally efficient\n• Transparent calculation process\n• Easy to validate and audit\n\nRAKING:\n• Handles multiple variables simultaneously\n• More comprehensive adjustment\n• Better for complex sampling designs\n• Can improve representativity significantly"
    },
    {
      q: "What are common pitfalls to avoid?",
      a: "COMMON PITFALLS:\n\nFor both methods:\n• Using unreliable population data\n• Small sample sizes in categories\n• Highly correlated adjustment variables\n• Not checking for extreme weights\n\nSpecific to raking:\n• Too many variables (over-parameterization)\n• Poor convergence\n• Not monitoring iteration progress\n• Ignoring weight variability"
    }
  ]
};

const RobotIcon = () => (
  <svg viewBox="0 0 24 24" width="24" height="24" fill="#219653">
    <rect x="5" y="7" width="14" height="10" rx="3" />
    <circle cx="10" cy="12" r="1.5" fill="#fff" />
    <circle cx="14" cy="12" r="1.5" fill="#fff" />
    <rect x="11" y="3" width="2" height="3" rx="1" />
  </svg>
);

/* ------------------------------------------------------------------ */
export default function Chatbot() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<keyof typeof weightingMethodsQA>("general");
  const bottomRef = useRef<HTMLDivElement | null>(null);

  /* auto‑scroll */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /* helpers */
  const addMessage = (role: "user" | "bot", content: string) => {
    setMessages((prev) => [...prev, { id: Math.random().toString(36).substr(2, 9), role, content }]);
  };

  const handleQuestionClick = (question: string, answer: string) => {
    addMessage("user", question);
    setTimeout(() => {
      addMessage("bot", answer);
    }, 300);
  };

  // Add welcome message on first load
  useEffect(() => {
    if (messages.length == 0) {
      addMessage("bot", "Hello! I'm your weighting assistant. 👋 Choose a category and click on any question to learn about statistical weighting methods and their calculations.");
    }
  }, []);

  /* ------------------------------------------------------------------ */
  return (
    <div className="chatbot-fullpage">
      {/* Header with home link */}
      <div className="chatbot-header">
        <Link to="/" className="home-link">
          ← Back to Home
        </Link>
        <h1>Weighting Methods Assistant</h1>
      </div>

      <div className="chatbot-container">
        {/* Category selector */}
        <div className="category-selector">
          <h2 className="category-title">Choose a Weighting Method</h2>
          <div className="category-buttons">
            <button
              className={selectedCategory === "general" ? "category-btn active" : "category-btn"}
              onClick={() => setSelectedCategory("general")}
            >
               General
            </button>
            <button
              className={selectedCategory === "postStratification" ? "category-btn active" : "category-btn"}
              onClick={() => setSelectedCategory("postStratification")}
            >
               Post-Stratification
            </button>
            <button
              className={selectedCategory === "raking" ? "category-btn active" : "category-btn"}
              onClick={() => setSelectedCategory("raking")}
            >
               Raking (IPF)
            </button>
            <button
              className={selectedCategory === "comparison" ? "category-btn active" : "category-btn"}
              onClick={() => setSelectedCategory("comparison")}
            >
               Comparison
            </button>
          </div>
        </div>

        <div className="chatbot-content">
          {/* Chat history */}
          <div className="chat-history">
            {messages.map((m) =>
              m.role === "bot" ? (
                <div key={m.id} className="message-row bot-row">
                  <div className="avatar">
                    <RobotIcon />
                  </div>
                  <div className="message-bubble bot-bubble">
                    {m.content.split('\n').map((line, i) => (
                      <React.Fragment key={i}>
                        {line}
                        <br />
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              ) : (
                <div key={m.id} className="message-row user-row">
                  <div className="message-bubble user-bubble">
                    {m.content}
                  </div>
                  <div className="avatar user-avatar">
                    <span>👤</span>
                  </div>
                </div>
              )
            )}
            <div ref={bottomRef} />
          </div>

          {/* Question chips organized by category */}
          <div className="questions-section">
            <h3 className="questions-title">
              {selectedCategory === "general" && " General Weighting Questions"}
              {selectedCategory === "postStratification" && " Post-Stratification Questions"}
              {selectedCategory === "raking" && " Raking (IPF) Questions"}
              {selectedCategory === "comparison" && " Method Comparison Questions"}
            </h3>
            
            <div className="questions-grid">
              {weightingMethodsQA[selectedCategory].map(({ q, a }) => (
                <button
                  key={q}
                  className="question-chip"
                  onClick={() => handleQuestionClick(q, a)}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Information message */}
        <div className="info-message">
          <p> Select questions from the categories above to learn about weighting methods and their calculations</p>
        </div>
      </div>

      <style>{`
        .chatbot-fullpage {
          width: 100%;
          min-height: 100vh;
          background: linear-gradient(135deg, #07793aff 0%, #07793aff 100%);
          padding: 20px;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .chatbot-header {
          width: 100%;
          max-width: 1200px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 20px;
          padding: 0 20px;
        }

        .home-link {
          color: white;
          text-decoration: none;
          font-weight: 600;
          padding: 10px 15px;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 8px;
          transition: all 0.3s ease;
        }

        .home-link:hover {
          background: rgba(255, 255, 255, 0.3);
          transform: translateY(-2px);
        }

        .chatbot-header h1 {
          color: white;
          margin: 0;
          font-size: 2rem;
          font-weight: 700;
        }

        .chatbot-container {
          width: 100%;
          max-width: 1200px;
          height: 80vh;
          background: white;
          border-radius: 20px;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .category-selector {
          padding: 20px;
          background: #f8f9fa;
          border-bottom: 2px solid #e9ecef;
        }

        .category-title {
          margin: 0 0 15px 0;
          font-size: 1.3rem;
          color: #2d3748;
          font-weight: 700;
          text-align: center;
        }

        .category-buttons {
          display: flex;
          gap: 10px;
          justify-content: center;
          flex-wrap: wrap;
        }

        .category-btn {
          padding: 12px 20px;
          border: 2px solid #e2e8f0;
          border-radius: 10px;
          background: white;
          color: #07793aff;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          font-size: 14px;
        }

        .category-btn:hover {
          border-color: #07793aff;
          color: #07793aff;
          transform: translateY(-2px);
        }

        .category-btn.active {
          background: #07793aff;
          border-color: #053e1fff;
          color: white;
          transform: translateY(-2px);
        }

        .chatbot-content {
          display: flex;
          flex: 1;
          overflow: hidden;
        }

        .chat-history {
          flex: 1;
          padding: 20px;
          overflow-y: auto;
          background: #fafafa;
          border-right: 2px solid #e9ecef;
        }

        .message-row {
          display: flex;
          margin-bottom: 15px;
          align-items: flex-start;
        }

        .bot-row {
          flex-direction: row;
        }

        .user-row {
          flex-direction: row-reverse;
        }

        .avatar {
          margin: 0 10px;
          padding: 8px;
          background: #ebf8ff;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          min-width: 40px;
          height: 40px;
        }

        .user-avatar {
          background: #fed7d7;
        }

        .message-bubble {
          padding: 15px 20px;
          border-radius: 20px;
          max-width: 70%;
          line-height: 1.5;
          font-size: 15px;
        }

        .bot-bubble {
          background: #e6fffa;
          border: 2px solid #81e6d9;
          color: #234e52;
          border-bottom-left-radius: 5px;
        }

        .user-bubble {
          background: #ebf8ff;
          border: 2px solid #07793aff;
          color: #07793aff;
          border-bottom-right-radius: 5px;
        }

        .questions-section {
          width: 400px;
          padding: 20px;
          background: #f8f9fa;
          overflow-y: auto;
        }

        .questions-title {
          margin: 0 0 15px 0;
          font-size: 1.1rem;
          color: #2d3748;
          font-weight: 600;
        }

        .questions-grid {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .question-chip {
          padding: 15px;
          background: white;
          border: 2px solid #e2e8f0;
          border-radius: 12px;
          color: #4a5568;
          font-weight: 500;
          text-align: left;
          cursor: pointer;
          transition: all 0.3s ease;
          font-size: 14px;
        }

        .question-chip:hover {
          border-color: #07793aff;
          background: #ebf8ff;
          color: #07793aff;
          transform: translateX(5px);
        }

        .info-message {
          padding: 15px 20px;
          background: #fff3cd;
          border-top: 2px solid #ffeaa7;
          text-align: center;
        }

        .info-message p {
          margin: 0;
          color: #856404;
          font-size: 14px;
          font-weight: 500;
        }

        @media (max-width: 768px) {
          .chatbot-header {
            flex-direction: column;
            gap: 15px;
            text-align: center;
          }

          .chatbot-header h1 {
            font-size: 1.5rem;
          }

          .chatbot-content {
            flex-direction: column;
          }
          
          .questions-section {
            width: 100%;
            border-right: none;
            border-top: 2px solid #e9ecef;
          }
          
          .category-buttons {
            flex-direction: column;
            align-items: center;
          }
          
          .category-btn {
            width: 200px;
          }
        }
      `}</style>
    </div>
  );
}