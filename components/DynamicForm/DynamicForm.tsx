'use client'

import React, { useState, FormEvent, useEffect } from 'react';
import { useStore } from '@/store/store';
import axios from 'axios';
import ProgressBar from '@/components/ProgreseBar/ProgreseBar';
import { FormInput } from '@/components/ProgreseBar/FormInput';
import { CldUploadWidget, CloudinaryUploadWidgetResults } from 'next-cloudinary';
import { useRouter } from 'next/navigation';
import Payment from '@/components/Payment/Payment';
import siteData from '@/Data/data.json';
import formMetadata from '@/Data/formMetadata.json';
import { useSession, signIn } from 'next-auth/react';
import Footer from '@/components/FormFooter/Footer';
import { PageNavigation } from '@/components/FormpageNav/PageNavigation';
import { get, set, cloneDeep, merge } from 'lodash';
import confetti from 'canvas-confetti';

type DynamicObject = {
  [key: string]: any;
};

// Define field type
type Field = {
  name: string;
  label: string;
  type: string;
  placeholder?: string;
  availability?: boolean;
  rows?: number;
  value?: string;
};

// Define step type with proper optional properties
type Step = {
  number: number;
  title: string;
  description?: string;
  fields: Field[];
  array?: boolean;
  arrayName?: string;
  initialCount?: number;
  arrayFields?: Field[];
  canAdd?: boolean;
};

// Define array field type for complex nested arrays
type ArrayField = {
  name: string;
  label: string;
  type: string;
  placeholder?: string;
  arrayFields?: Field[];
  initialCount?: number;
  canAdd?: boolean;
};

interface DynamicFormProps {
  formId: number;
  siteId: number;
}

export function DynamicForm({ formId, siteId }: DynamicFormProps) {
  const { subdomain, availability, loading, setSubdomain, setAvailability, setLoading, isPaymentComplete, setPaymentComplete } = useStore();
  const { data: session } = useSession();
  const [isNavOpen, setIsNavOpen] = useState(false);
  const router = useRouter();
  
  // Get form metadata
  const formMeta = formMetadata.forms.find(form => form.id === formId);
  if (!formMeta) {
    return <div>Form not found</div>;
  }
  
  // Get site data
  const site = siteData.sites.find(site => site.id === siteId);
  if (!site) {
    return <div>Site not found</div>;
  }
  
  const totalSteps = formMeta.steps.length;
  const storageKey = `form${formId}`;
  
  // Initialize current step
  const [currentStep, setCurrentStep] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedStep = sessionStorage.getItem(`${storageKey}_currentStep`);
      return savedStep ? parseInt(savedStep) : 1;
    }
    return 1;
  });
  
  // Initialize form data with defaults based on metadata
  const initializeFormData = () => {
    const defaultData: DynamicObject = {
      repo_name: {
        repo: formMeta.repo
      }
    };
    
    // Initialize arrays based on metadata
    formMeta.steps.forEach((step: Step) => {
      if (step.array && step.arrayName) {
        const initialCount = step.initialCount || 1;
        const arrayName = step.arrayName;
        
        if (arrayName.includes('.')) {
          // Handle nested arrays
          const parts = arrayName.split('.');
          let current = defaultData;
          
          // Create parent objects if needed
          for (let i = 0; i < parts.length - 1; i++) {
            if (!current[parts[i]]) current[parts[i]] = {};
            current = current[parts[i]];
          }
          
          // Initialize array with given count
          current[parts[parts.length - 1]] = Array(initialCount).fill(null).map(() => {
            const item: DynamicObject = {};
            const fieldsToUse = step.arrayFields || step.fields;
            
            fieldsToUse.forEach((field: Field) => {
              set(item, field.name, '');
            });
            
            return item;
          });
        } else {
          // Handle root-level arrays
          defaultData[arrayName] = Array(initialCount).fill(null).map(() => {
            const item: DynamicObject = {};
            
            step.fields.forEach((field: Field) => {
              set(item, field.name, '');
            });
            
            return item;
          });
        }
      }
    });
    
    return defaultData;
  };
  
  // State for form data
  const [formData, setFormData] = useState<DynamicObject>(() => {
    if (typeof window !== 'undefined') {
      const savedFormData = sessionStorage.getItem(`${storageKey}_formData`);
      const savedSubdomain = sessionStorage.getItem(`${storageKey}_subdomain`);
      
      if (savedSubdomain) {
        setSubdomain(savedSubdomain);
      }
      
      return savedFormData ? merge(initializeFormData(), JSON.parse(savedFormData)) : initializeFormData();
    }
    return initializeFormData();
  });
  
  // Save form data to sessionStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(`${storageKey}_formData`, JSON.stringify(formData));
      sessionStorage.setItem(`${storageKey}_currentStep`, currentStep.toString());
      if (subdomain) {
        sessionStorage.setItem(`${storageKey}_subdomain`, subdomain);
      }
    }
  }, [formData, currentStep, subdomain, storageKey]);
  
  // Clear session storage after successful form submission
  const clearSessionStorage = () => {
    sessionStorage.removeItem(`${storageKey}_formData`);
    sessionStorage.removeItem(`${storageKey}_currentStep`);
    sessionStorage.removeItem(`${storageKey}_subdomain`);
  };
  
  // Payment success handler
  useEffect(() => {
    if (isPaymentComplete) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  }, [isPaymentComplete]);
  
  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => {
      const newFormData = cloneDeep(prev);
      set(newFormData, name, value);
      return newFormData;
    });
  };
  
  // Handle array changes
  const handleArrayInputChange = (arrayName: string, index: number, fieldName: string, value: string) => {
    setFormData(prev => {
      const newFormData = cloneDeep(prev);
      const fullPath = `${arrayName}[${index}].${fieldName}`;
      set(newFormData, fullPath, value);
      return newFormData;
    });
  };
  
  // Handle form submission
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!session) {
      signIn('github');
      return;
    }
    
    if (!subdomain) {
      alert('Please enter a subdomain');
      return;
    }
    
    if (!availability || !availability.includes('available')) {
      alert('Please enter an available subdomain');
      return;
    }

    if (!session?.user?.name) {
      console.error('User name not found in session:', session);
      alert('Authentication error. Please try logging in again.');
      return;
    }

    const userId = session.user.name;
    
    // If email is missing, use a default format
    const userEmail = session.user?.email || `${session.user.name}@github.com`;
    
    const data = {
      ...formData,
      subdomain,
    };
    
    try {
      setLoading(true);
      
      // Get the GitHub access token from the session
      const userToken = (session as any)?.accessToken;

      if (!userToken) {
        console.error('GitHub token not found in session');
        alert('Authentication error. Please try logging in again.');
        return;
      }

      // Step 1: Create a new Gist with the token
      const createGistResponse = await fetch("https://folio4ubackend-production.up.railway.app/create-gist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          content: JSON.stringify(data, null, 2),
          userToken: userToken
        }),
      });

      if (!createGistResponse.ok) {
        const errorData = await createGistResponse.json();
        throw new Error(errorData.message || "Failed to create the Gist");
      }

      const { gistRawUrl } = await createGistResponse.json();

      // Step 2: Store user and site data with site name
      const storePayload = {
        userId: userId,
        userEmail: userEmail,
        userName: session.user.name,
        subdomain: subdomain,
        gistUrl: gistRawUrl,
        siteName: site.title
      };

      console.log('Sending payload to store-hosted-site:', storePayload);

      const storeResponse = await fetch("https://folio4ubackend-production.up.railway.app/store-hosted-site", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(storePayload),
      });

      if (!storeResponse.ok) {
        const errorData = await storeResponse.json();
        throw new Error(errorData.message || "Failed to store site information");
      }

      // Step 3: Update the Gist URL in the repository
      const updateGistUrlResponse = await fetch("https://folio4ubackend-production.up.railway.app/update-gist-url", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          gistRawUrl, 
          subdomain,
          repoName: formData.repo_name.repo
        }),
      });

      if (!updateGistUrlResponse.ok) {
        throw new Error("Failed to update the Gist URL");
      }
      
      // After successful submission, clear the session storage
      clearSessionStorage();
      setLoading(false);
      
      // Reset payment complete state after 5 seconds
      setTimeout(() => {
        setPaymentComplete(false);
      }, 5000);
      
      // Redirect to success page
      router.push('/users/pipeline');
    } catch (error) {
      setLoading(false);
      console.error("Error during submission:", error);
      alert("An error occurred. Please try again.");
    }
  };
  
  // Check subdomain availability
  const checkAvailability = async () => {
    if (!subdomain) {
      alert('Please enter a subdomain');
      return;
    }

    setLoading(true);
    setAvailability(null);

    try {
      const response = await axios.get(`https://folio4ubackend-production.up.railway.app/check-domain/${subdomain}`);
      if (response.data.available) {
        setAvailability(`Subdomain "${subdomain}.netlify.app" is available.`);
      } else {
        setAvailability(`Subdomain "${subdomain}.netlify.app" is not available.`);
      }
    } catch (error) {
      console.error('Error during subdomain check:', error);
      setAvailability('An error occurred while checking availability.');
    } finally {
      setLoading(false);
    }
  };
  
  // Step navigation
  const nextStep = () => setCurrentStep((prev) => Math.min(prev + 1, totalSteps));
  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 1));
  const handleStepClick = (step: number) => setCurrentStep(step);
  
  // Handle image upload
  const handleImageUpload = (fieldPath: string) => (result: CloudinaryUploadWidgetResults) => {
    if (result.event !== 'success') return;
    
    const info = result.info as { secure_url: string };
    
    setFormData(prev => {
      const newFormData = cloneDeep(prev);
      set(newFormData, fieldPath, info.secure_url);
      return newFormData;
    });
  };
  
  // Handle array image upload
  const handleArrayImageUpload = (arrayName: string, index: number, fieldName: string) => (result: CloudinaryUploadWidgetResults) => {
    if (result.event !== 'success') return;
    
    const info = result.info as { secure_url: string };
    
    setFormData(prev => {
      const newFormData = cloneDeep(prev);
      const fullPath = `${arrayName}[${index}].${fieldName}`;
      set(newFormData, fullPath, info.secure_url);
      return newFormData;
    });
  };
  
  // Get value from nested object
  const getValue = (obj: DynamicObject, path: string): string => {
    return get(obj, path, '');
  };
  
  // Image upload field
  const ImageUploadField = ({ fieldName, label }: { fieldName: string; label: string }) => {
    const value = getValue(formData, fieldName);
    
    return (
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">{label}</label>
        <div className="flex items-center gap-2">
          <CldUploadWidget
            options={{ 
              cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
              uploadPreset: 'my_uploads'
            }}
            onSuccess={handleImageUpload(fieldName)}
          >
            {({ open }) => (
              <button
                type="button"
                onClick={() => open()}
                className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded"
                aria-label={`Upload ${label}`}
              >
                Upload Image
              </button>
            )}
          </CldUploadWidget>
          {value && (
            <div className="relative w-16 h-16 border rounded overflow-hidden">
              <img src={value} alt={label} className="w-full h-full object-cover" />
            </div>
          )}
        </div>
        {value && (
          <input 
            type="text" 
            value={value} 
            readOnly 
            className="mt-1 w-full border-gray-300 rounded-md shadow-sm p-2 text-xs"
            aria-label={`${label} URL`}
          />
        )}
      </div>
    );
  };
  
  // Array image upload field
  const ArrayImageUploadField = ({ arrayName, index, fieldName, label }: { arrayName: string; index: number; fieldName: string; label: string }) => {
    const value = getValue(formData, `${arrayName}[${index}].${fieldName}`);
    
    return (
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">{label}</label>
        <div className="flex items-center gap-2">
          <CldUploadWidget
            options={{ 
              cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
              uploadPreset: 'my_uploads'
            }}
            onSuccess={handleArrayImageUpload(arrayName, index, fieldName)}
          >
            {({ open }) => (
              <button
                type="button"
                onClick={() => open()}
                className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded"
                aria-label={`Upload ${label} for item ${index + 1}`}
              >
                Upload Image
              </button>
            )}
          </CldUploadWidget>
          {value && (
            <div className="relative w-16 h-16 border rounded overflow-hidden">
              <img src={value} alt={label} className="w-full h-full object-cover" />
            </div>
          )}
        </div>
        {value && (
          <input 
            type="text" 
            value={value} 
            readOnly 
            className="mt-1 w-full border-gray-300 rounded-md shadow-sm p-2 text-xs"
            aria-label={`${label} URL for item ${index + 1}`}
          />
        )}
      </div>
    );
  };
  
  // Add array item
  const addArrayItem = (arrayName: string, step: Step) => {
    setFormData(prev => {
      const newFormData = cloneDeep(prev);
      const array = get(newFormData, arrayName, []);
      
      const newItem: DynamicObject = {};
      const fieldsToUse = step.arrayFields || step.fields;
      
      fieldsToUse.forEach((field: Field) => {
        set(newItem, field.name, '');
      });
      
      set(newFormData, arrayName, [...array, newItem]);
      return newFormData;
    });
  };
  
  // Remove array item
  const removeArrayItem = (arrayName: string, index: number) => {
    setFormData(prev => {
      const newFormData = cloneDeep(prev);
      const array = get(newFormData, arrayName, []);
      
      if (array.length <= 1) return prev;
      
      const newArray = [...array.slice(0, index), ...array.slice(index + 1)];
      set(newFormData, arrayName, newArray);
      
      return newFormData;
    });
  };
  
  // Render step content
  const renderStep = () => {
    const step = formMeta.steps.find(s => s.number === currentStep) as Step | undefined;
    
    if (!step) return null;
    
    return (
      <div className="p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-lg font-semibold mb-4">{step.title}</h2>
        
        {/* Regular Fields */}
        {step.fields && step.fields.map((field: Field, index: number) => {
          if (field.type === 'image') {
            return <ImageUploadField key={index} fieldName={field.name} label={field.label} />;
          }
          
          if (field.type === 'textarea') {
            return (
              <div className="mb-4" key={index}>
                <label className="block text-sm font-medium mb-1">{field.label}</label>
                <textarea
                  name={field.name}
                  value={getValue(formData, field.name)}
                  onChange={handleInputChange}
                  placeholder={field.placeholder}
                  className="w-full border-gray-300 rounded-md shadow-sm p-2"
                  rows={4}
                />
              </div>
            );
          }
          
          return (
            <div className="mb-4" key={index}>
              <label className="block text-sm font-medium mb-1">{field.label}</label>
              <input
                type={field.type || 'text'}
                name={field.name}
                value={
                  field.name === 'subdomain' 
                    ? subdomain 
                    : getValue(formData, field.name)
                }
                onChange={(e) => {
                  if (field.name === 'subdomain') {
                    setSubdomain(e.target.value);
                    setAvailability(null);
                  } else {
                    handleInputChange(e);
                  }
                }}
                placeholder={field.placeholder}
                className="w-full border-gray-300 rounded-md shadow-sm p-2"
              />
              {field.name === 'subdomain' && field.availability && (
                <div className="mt-1">
                  {loading && <p className="text-gray-500 text-sm">Checking availability...</p>}
                  {!loading && availability && (
                    <p className="mt-2 text-sm text-gray-600">{availability}</p>
                  )}
                  <button
                    onClick={checkAvailability}
                    disabled={loading}
                    className="w-full mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300 transition-colors"
                    type="button"
                  >
                    {loading ? 'Checking...' : 'Check Availability'}
                  </button>
                </div>
              )}
            </div>
          );
        })}
        
        {/* Array Fields */}
        {step.array && step.arrayName && (
          <div className="mt-6">
            <h3 className="text-md font-medium mb-4">{step.title} Items</h3>
            
            {get(formData, step.arrayName, []).map((item: any, index: number) => {
              const fieldsToUse = step.arrayFields || step.fields;
              
              return (
                <div key={index} className="mb-6 p-4 border rounded-md relative">
                  <div className="absolute top-2 right-2">
                    {index > 0 && (
                      <button
                        type="button"
                        onClick={() => removeArrayItem(step.arrayName!, index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  
                  <h4 className="text-sm font-medium mb-3">Item {index + 1}</h4>
                  
                  {fieldsToUse.map((field: Field, fieldIndex: number) => {
                    if (field.type === 'image') {
                      return (
                        <ArrayImageUploadField 
                          key={fieldIndex} 
                          arrayName={step.arrayName!} 
                          index={index} 
                          fieldName={field.name} 
                          label={field.label} 
                        />
                      );
                    }
                    
                    if (field.type === 'textarea') {
                      return (
                        <div className="mb-4" key={fieldIndex}>
                          <label className="block text-sm font-medium mb-1">{field.label}</label>
                          <textarea
                            value={getValue(formData, `${step.arrayName}[${index}].${field.name}`)}
                            onChange={(e) => handleArrayInputChange(step.arrayName!, index, field.name, e.target.value)}
                            placeholder={field.placeholder}
                            className="w-full border-gray-300 rounded-md shadow-sm p-2"
                            rows={4}
                          />
                        </div>
                      );
                    }
                    
                    return (
                      <div className="mb-4" key={fieldIndex}>
                        <label className="block text-sm font-medium mb-1">{field.label}</label>
                        <input
                          type={field.type || 'text'}
                          value={getValue(formData, `${step.arrayName}[${index}].${field.name}`)}
                          onChange={(e) => handleArrayInputChange(step.arrayName!, index, field.name, e.target.value)}
                          placeholder={field.placeholder}
                          className="w-full border-gray-300 rounded-md shadow-sm p-2"
                        />
                      </div>
                    );
                  })}
                </div>
              );
            })}
            
            {step.canAdd && step.arrayName && (
              <button
                type="button"
                onClick={() => addArrayItem(step.arrayName!, step)}
                className="mt-2 bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded"
              >
                Add Item
              </button>
            )}
          </div>
        )}
      </div>
    );
  };
  
  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <PageNavigation isOpen={isNavOpen} onClose={() => setIsNavOpen(false)} />
      
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-2xl font-bold mb-6">{site.title} Form</h1>
        
        <div className="flex flex-col md:flex-row gap-6">
          <div className="md:sticky md:top-8 md:self-start">
            <ProgressBar
              currentStep={currentStep}
              totalSteps={totalSteps}
              onStepClick={handleStepClick}
              steps={formMeta.steps.map(step => ({
                number: step.number,
                title: step.title
              }))}
            />
          </div>
          
          <div className="flex-1 md:max-h-[calc(100vh-120px)] md:overflow-y-auto bg-white rounded-lg shadow">
            <form onSubmit={handleSubmit} className="h-full">
              {renderStep()}
              
              <div className="mt-6 flex justify-between p-6 bg-gray-50 border-t sticky bottom-0">
                {currentStep > 1 && (
                  <button
                    type="button"
                    onClick={prevStep}
                    className="bg-gray-500 hover:bg-gray-600 text-white py-2 px-6 rounded"
                  >
                    Previous
                  </button>
                )}
                
                {currentStep < totalSteps ? (
                  <button
                    type="button"
                    onClick={nextStep}
                    className="ml-auto bg-blue-500 hover:bg-blue-600 text-white py-2 px-6 rounded"
                  >
                    Next
                  </button>
                ) : (
                  <div className="ml-auto">
                    {isPaymentComplete ? (
                      <button
                        type="submit"
                        className="bg-green-500 hover:bg-green-600 text-white py-2 px-6 rounded"
                        disabled={loading}
                      >
                        {loading ? 'Submitting...' : 'Submit'}
                      </button>
                    ) : (
                      <Payment onSuccess={() => {}} amount={Number(site.amount)} />
                    )}
                  </div>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
} 