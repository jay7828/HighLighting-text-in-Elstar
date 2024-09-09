import React, { useRef, useState, useEffect } from 'react';

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

  // Initialize refs for a specific patient
  const initializeRefs = (patientIndex: number) => {
    inputRefs.current[patientIndex] = {};
    outputRefs.current[patientIndex] = {};
  };

  // Handle scroll for a particular sentence/word
  const handleOutputClick = (patientIndex: number, phrase: string) => {
    const inputElement = inputRefs.current[patientIndex]?.[phrase];
    if (inputElement) {
      inputElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  return (
    <div>
      {patientsData.map((patient, index) => {
        const highlightedPhrases = [
          'worsening abdominal pain',
          'hydroxyurea',
          'fatigue'
        ]; // Customize this list as needed
        const patientName = `${patient.first_name ?? ''} ${patient.last_name ?? ''}`;

        // Initialize refs for this patient
        initializeRefs(index);

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
                {patient.data[0].notes.split(' ').map((word, wordIndex) => {
                  const key = highlightedPhrases.find(phrase =>
                    phrase.split(' ').some(w => w === word)
                  );

                  return key ? (
                    <span
                      key={`${word}-${wordIndex}`}
                      ref={(el) => {
                        if (el) inputRefs.current[index][key] = el;
                      }}
                      style={{ backgroundColor: 'yellow' }}
                    >
                      {word}{' '}
                    </span>
                  ) : (
                    `${word} `
                  );
                })}
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
                {patient.data[0].summary.split(' ').map((word, wordIndex) => {
                  const key = highlightedPhrases.find(phrase =>
                    phrase.split(' ').some(w => w === word)
                  );

                  return key ? (
                    <span
                      key={`${word}-${wordIndex}`}
                      ref={(el) => {
                        if (el) outputRefs.current[index][key] = el;
                      }}
                      style={{
                        backgroundColor: 'lightblue',
                        cursor: 'pointer',
                      }}
                      onClick={() => handleOutputClick(index, key)}
                    >
                      {word}{' '}
                    </span>
                  ) : (
                    `${word} `
                  );
                })}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Home;
