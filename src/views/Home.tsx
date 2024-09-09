import React, { useRef, useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';

// Data From the data.json file
import jsonData from './data.json';

type DischargeSummary = {
  subject_id: number;
  first_name: string | null;
  last_name: string | null;
  age: number | null;
  gender: string | null;
  data: SummaryData[];
};

type SummaryData = {
  summary_review_id: number;
  row_id: number;
  doctor_summary: string | null;
  notes: string;
  notes_date: string;
  category: string;
  output_audio_media_url: string | null;
  raw_summary: string | null;
  summarization_run_date: string;
  summary: string;
  validation: string;
  comment: string | null;
  rating: number | null;
  llm_modelid: number;
  inserted_at: string;
  updated_at: string | null;
  workspaceid: number;
  llm_short_name: string;
};

const Home: React.FC = () => {
  // State to hold the loaded JSON data
  const [patientsData, setPatientsData] = useState<DischargeSummary[]>([]);

  // Refs for input and output scrolls, organized by patient index
  const inputRefs = useRef<{ [patientIndex: number]: { [key: string]: HTMLElement | null } }>({});
  const outputRefs = useRef<{ [patientIndex: number]: { [key: string]: HTMLElement | null } }>({});

  // Load the JSON data 
  useEffect(() => {
    setPatientsData(jsonData.data[0].get_summary_data);
  }, []);

  // Handle scroll for a particular highlighted phrase
  const handleOutputClick = (patientIndex: number, phrase: string) => {
    const inputElement = inputRefs.current[patientIndex]?.[phrase];
    if (inputElement) {
      inputElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  return (
    <div>
      {patientsData.map((patient, index) => {
        const patientName = `${patient.first_name ?? ''} ${patient.last_name ?? ''}`;

        // Ensure refs are initialized for this patient
        if (!inputRefs.current[index]) {
          inputRefs.current[index] = {};
        }
        if (!outputRefs.current[index]) {
          outputRefs.current[index] = {};
        }

        return (
          <div key={index} style={{ marginBottom: '50px' }}>
            <h3>{`Patient: ${patientName} (ID: ${patient.subject_id})`}</h3>

            <div style={{ display: 'flex', gap: '20px' }}>
              {/* Input Box (Notes) */}
              <div
                style={{
                  width: '45%',
                  height: '200px',
                  overflowY: 'scroll',
                  border: '1px solid black',
                  padding: '10px',
                }}
              >
                <ReactMarkdown
                  children={patient.data[0]?.notes || ''}
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeRaw as any]}  // Enable inline HTML rendering
                  components={{
                    span: ({ node, ...props }) => {
                      const style = (node.properties?.style as string) || '';
                      const isHighlighted = style.includes('background-color:yellow');
                      const phrase = props.children?.toString() || '';

                      return (
                        <span
                          {...props}
                          ref={(el) => {
                            if (el && isHighlighted) inputRefs.current[index][phrase] = el;
                          }}
                          style={{ backgroundColor: isHighlighted ? 'yellow' : undefined }}
                        />
                      );
                    }
                  }}
                />
              </div>

              {/* Output Box (Summary) */}
              <div
                style={{
                  width: '45%',
                  height: '200px',
                  overflowY: 'scroll',
                  border: '1px solid black',
                  padding: '10px',
                }}
              >
                <ReactMarkdown
                  children={patient.data[0]?.summary || ''}
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeRaw as any]}  // Enable inline HTML rendering
                  components={{
                    span: ({ node, ...props }) => {
                      const style = (node.properties?.style as string) || '';
                      const isHighlighted = style.includes('background-color:yellow');
                      const phrase = props.children?.toString() || '';

                      return (
                        <span
                          {...props}
                          ref={(el) => {
                            if (el && isHighlighted) outputRefs.current[index][phrase] = el;
                          }}
                          style={{
                            backgroundColor: isHighlighted ? 'lightblue' : undefined,
                            cursor: isHighlighted ? 'pointer' : 'default',
                          }}
                          onClick={() => isHighlighted && handleOutputClick(index, phrase)}
                        />
                      );
                    }
                  }}
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Home;