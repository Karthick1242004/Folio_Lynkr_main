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

// Declare the global window property
declare global {
  interface Window {
    __UPLOADED_CLOUDINARY_URLS?: Map<string, string>;
  }
}

type DynamicObject = {
  [key: string]: any;
};

// Define temporary file type
type TempFile = {
  file: File;
  preview: string;
  path: string;
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
  
  // Add state for temporary files
  const [tempFiles, setTempFiles] = useState<TempFile[]>([]);
  const [uploadError, setUploadError] = useState<string | null>(null);
  
  // Cleanup object URLs when component unmounts
  useEffect(() => {
    return () => {
      // Revoke all object URLs to prevent memory leaks
      tempFiles.forEach(tempFile => {
        if (tempFile.preview) {
          URL.revokeObjectURL(tempFile.preview);
        }
      });
    };
  }, [tempFiles]);
  
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
    
    // Process each step to build the correct data structure
    formMeta.steps.forEach((step: Step) => {
      // Handle regular fields
      if (!step.array) {
        step.fields.forEach((field: Field) => {
          // Skip subdomain field as it's handled separately
          if (field.name !== 'subdomain') {
            // Create any nested objects if needed
            if (field.name.includes('.')) {
              const parts = field.name.split('.');
              let current = defaultData;
              
              // Create parent objects if needed
              for (let i = 0; i < parts.length - 1; i++) {
                if (!current[parts[i]]) {
                  current[parts[i]] = {};
                }
                current = current[parts[i]];
              }
              
              // Set the value
              current[parts[parts.length - 1]] = '';
            } else {
              defaultData[field.name] = '';
            }
          }
        });
      }
      
      // Handle array fields
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
              if (field.name.includes('.')) {
                // Handle nested fields within array items
                const fieldParts = field.name.split('.');
                let currentItem = item;
                
                for (let i = 0; i < fieldParts.length - 1; i++) {
                  if (!currentItem[fieldParts[i]]) {
                    currentItem[fieldParts[i]] = {};
                  }
                  currentItem = currentItem[fieldParts[i]];
                }
                
                currentItem[fieldParts[fieldParts.length - 1]] = '';
              } else {
                item[field.name] = '';
              }
            });
            
            return item;
          });
        } else {
          // Handle root-level arrays
          defaultData[arrayName] = Array(initialCount).fill(null).map(() => {
            const item: DynamicObject = {};
            
            // Use arrayFields if defined, otherwise use fields
            const fieldsToUse = step.arrayFields || step.fields;
            
            fieldsToUse.forEach((field: Field) => {
              if (field.name.includes('.')) {
                // Handle nested fields within array items
                const fieldParts = field.name.split('.');
                let currentItem = item;
                
                for (let i = 0; i < fieldParts.length - 1; i++) {
                  if (!currentItem[fieldParts[i]]) {
                    currentItem[fieldParts[i]] = {};
                  }
                  currentItem = currentItem[fieldParts[i]];
                }
                
                currentItem[fieldParts[fieldParts.length - 1]] = '';
              } else {
                item[field.name] = '';
              }
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
  
  // Function to check file size (max 1.5MB)
  const validateFileSize = (file: File): boolean => {
    const maxSize = 1.5 * 1024 * 1024; // 1.5MB in bytes
    if (file.size > maxSize) {
      setUploadError(`File size exceeds 1.5MB limit (${(file.size / (1024 * 1024)).toFixed(2)}MB)`);
      return false;
    }
    setUploadError(null);
    return true;
  };

  // Handle image selection (stores locally without uploading to Cloudinary)
  const handleImageSelection = (fieldPath: string) => (event: any) => {
    if (event.target?.files?.[0]) {
      const file = event.target.files[0];
      
      if (!validateFileSize(file)) return;
      
      // Create a temporary file object with preview URL
      const preview = URL.createObjectURL(file);
      console.log(`Created blob URL for ${fieldPath}: ${preview}`);
      
      // Store the file information
      setTempFiles(prev => {
        // Remove any existing temp file for this field
        const filtered = prev.filter(item => item.path !== fieldPath);
        return [...filtered, { file, preview, path: fieldPath }];
      });
      
      // Update the form data with the preview URL for display purposes
      setFormData(prev => {
        const newFormData = cloneDeep(prev);
        set(newFormData, fieldPath, preview);
        return newFormData;
      });
    }
  };
  
  // Handle array image selection
  const handleArrayImageSelection = (arrayName: string, index: number, fieldName: string) => (event: any) => {
    if (event.target?.files?.[0]) {
      const file = event.target.files[0];
      
      if (!validateFileSize(file)) return;
      
      // Create a temporary file object with preview URL
      const preview = URL.createObjectURL(file);
      const path = `${arrayName}[${index}].${fieldName}`;
      console.log(`Created blob URL for ${path}: ${preview}`);
      
      // Store the file information
      setTempFiles(prev => {
        // Remove any existing temp file for this field
        const filtered = prev.filter(item => item.path !== path);
        return [...filtered, { file, preview, path }];
      });
      
      // Update the form data with the preview URL for display purposes
      setFormData(prev => {
        const newFormData = cloneDeep(prev);
        set(newFormData, path, preview);
        return newFormData;
      });
    }
  };
  
  // Upload all stored temp files to Cloudinary
  const uploadAllFiles = async (): Promise<boolean> => {
    if (tempFiles.length === 0) return true;
    
    try {
      setLoading(true);
      const uploadPromises = tempFiles.map(async (tempFile) => {
        const formData = new FormData();
        formData.append('file', tempFile.file);
        formData.append('upload_preset', 'my_uploads');
        
        console.log(`Uploading file for path: ${tempFile.path}`);
        const response = await fetch(`https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`, {
          method: 'POST',
          body: formData
        });
        
        if (!response.ok) {
          throw new Error(`Failed to upload ${tempFile.file.name}`);
        }
        
        const data = await response.json();
        console.log(`Upload successful for ${tempFile.path}:`, data.secure_url);
        return { path: tempFile.path, url: data.secure_url, blob: tempFile.preview };
      });
      
      try {
        const uploadResults = await Promise.all(uploadPromises);
        console.log('All upload results:', uploadResults);
        
        // Create a map of paths to Cloudinary URLs for later use
        const uploadedUrls = new Map();
        uploadResults.forEach(({ path, url }) => {
          uploadedUrls.set(path, url);
        });
        
        // Map of blob URLs to Cloudinary URLs for reference
        const blobToCloudinaryMap = new Map();
        uploadResults.forEach(result => {
          blobToCloudinaryMap.set(result.blob, result.url);
        });
        
        // Update form data with real cloudinary URLs (use a single state update)
        const updatedFormData = cloneDeep(formData);
        uploadResults.forEach(({ path, url }) => {
          console.log(`Setting ${path} to ${url}`);
          set(updatedFormData, path, url);
        });
        
        // Update the state once with all changes
        setFormData(updatedFormData);
        
        // Store the updated data in a variable for direct use
        // (don't rely on checking formData state which might not be updated yet)
        const formDataForSubmission = updatedFormData;
        
        // Clear temp files as they've been uploaded
        setTempFiles([]);
        
        // Ensure we're using the updated data for submission
        console.log('Form data after updates:', formDataForSubmission);
        
        // Store the uploaded URLs for later use in the handleSubmit function
        window.__UPLOADED_CLOUDINARY_URLS = uploadedUrls;
        
        return true;
      } catch (uploadError) {
        console.error("Error in Promise.all for uploads:", uploadError);
        throw uploadError;
      }
    } catch (error) {
      console.error('Error uploading files:', error);
      alert('Failed to upload images. Please try again.');
      return false;
    } finally {
      setLoading(false);
    }
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

    // Check if payment is complete
    if (!isPaymentComplete) {
      alert('Please complete the payment first');
      return;
    }

    const userId = session.user.name;
    
    // If email is missing, use a default format
    const userEmail = session.user?.email || `${session.user.name}@github.com`;
    
    try {
      setLoading(true);
      
      // First, upload all images to Cloudinary
      const uploadSuccess = await uploadAllFiles();
      if (!uploadSuccess) {
        setLoading(false);
        return; // Stop if uploads failed
      }

      // Wait a bit for any state updates to complete
      await new Promise(resolve => setTimeout(resolve, 300));

      // Create a deep copy of the current form data
      const submissionData = cloneDeep(formData);
      
      // Add subdomain to the submission data
      submissionData.subdomain = subdomain;
      
      // Apply the stored Cloudinary URLs directly to ensure they're included
      const uploadedUrls = window.__UPLOADED_CLOUDINARY_URLS as Map<string, string> || new Map();
      uploadedUrls.forEach((url, path) => {
        set(submissionData, path, url);
      });
      
      console.log('Form data with directly applied URLs:', submissionData);

      // Find all image fields in the form meta
      const imageFields: string[] = [];
      formMeta.steps.forEach((step: Step) => {
        // Standard fields
        step.fields.forEach((field: Field) => {
          if (field.type === 'image') {
            imageFields.push(field.name);
          }
        });

        // Array fields
        if (step.array && step.arrayName) {
          const fieldsToUse = step.arrayFields || step.fields;
          fieldsToUse.forEach((field: Field) => {
            if (field.type === 'image') {
              // For arrays, we'll handle this during the cleaning phase
              imageFields.push(`${step.arrayName}[*].${field.name}`);
            }
          });
        }
      });

      console.log('Found image fields:', imageFields);

      // A more robust cleaning function that preserves valid image URLs
      const cleanData = (obj: any): any => {
        if (!obj || typeof obj !== 'object') return obj;
        
        if (Array.isArray(obj)) {
          return obj.map((item, index) => {
            const result = cleanData(item);
            return result;
          });
        }
        
        const result: DynamicObject = {};
        
        Object.keys(obj).forEach(key => {
          const value = obj[key];
          
          if (typeof value === 'string') {
            // Check if this is a blob URL
            if (value.startsWith('blob:')) {
              // For blobs, try to find the corresponding Cloudinary URL in our map
              for (const [path, url] of uploadedUrls.entries()) {
                if (path.endsWith(`.${key}`) || path === key) {
                  console.log(`Replacing blob URL in ${key} with Cloudinary URL: ${url}`);
                  result[key] = url;
                  return;
                }
              }
              // If we didn't find a match, set to empty string for image fields
              const isImageKey = key === 'image' || key === 'profileImage' || 
                                 key === 'featuredImage' || key.endsWith('.image');
              result[key] = isImageKey ? '' : value;
            } else if (value.includes('cloudinary.com')) {
              // Preserve all Cloudinary URLs
              result[key] = value;
            } else {
              // Other strings
              result[key] = value;
            }
          } else if (typeof value === 'object') {
            result[key] = cleanData(value);
          } else {
            result[key] = value;
          }
        });
        
        return result;
      };
      
      // Clean the data
      const cleanedData = cleanData(submissionData);
      
      // Special handling for array image fields (which are harder to check)
      imageFields.forEach(field => {
        if (field.includes('[*].')) {
          const [arrayPath, fieldName] = field.split('[*].');
          
          if (cleanedData[arrayPath] && Array.isArray(cleanedData[arrayPath])) {
            cleanedData[arrayPath].forEach((item: any, index: number) => {
              // If field exists but is empty and we have a valid URL from our map, use that
              if (item[fieldName] === '' || (item[fieldName] && item[fieldName].startsWith('blob:'))) {
                // Try to find a matching URL in our uploads map
                const fullPath = `${arrayPath}[${index}].${fieldName}`;
                if (uploadedUrls.has(fullPath)) {
                  console.log(`Setting array item ${fullPath} to ${uploadedUrls.get(fullPath)}`);
                  item[fieldName] = uploadedUrls.get(fullPath);
                }
              }
            });
          }
        }
      });
      
      // Directly check image fields we know about
      imageFields.forEach(field => {
        if (!field.includes('[*].')) {
          const currentValue = get(cleanedData, field);
          
          // If the field is empty or still has a blob URL, try to replace it
          if (!currentValue || currentValue === '' || (typeof currentValue === 'string' && currentValue.startsWith('blob:'))) {
            if (uploadedUrls.has(field)) {
              console.log(`Directly setting ${field} to ${uploadedUrls.get(field)}`);
              set(cleanedData, field, uploadedUrls.get(field));
            }
          }
        }
      });
      
      // Log the cleaned data for debugging
      console.log('Cleaned data ready for submission:', cleanedData);
      
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
          content: JSON.stringify(cleanedData, null, 2),
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
          repoName: cleanedData.repo_name.repo
        }),
      });

      if (!updateGistUrlResponse.ok) {
        throw new Error("Failed to update the Gist URL");
      }
      
      // After successful submission, clear the session storage
      clearSessionStorage();
      
      // Clean up global variable
      delete window.__UPLOADED_CLOUDINARY_URLS;
      
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
  
  // Get value from nested object
  const getValue = (obj: DynamicObject, path: string): string => {
    return get(obj, path, '');
  };
  
  // Image upload field
  const ImageUploadField = ({ fieldName, label }: { fieldName: string; label: string }) => {
    const value = getValue(formData, fieldName);
    const fileInputRef = React.useRef<HTMLInputElement>(null);
    
    return (
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">{label}</label>
        <div className="flex items-center gap-2">
          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            onChange={handleImageSelection(fieldName)}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded"
            aria-label={`Upload ${label}`}
          >
            Select Image
          </button>
          {value && (
            <div className="relative w-16 h-16 border rounded overflow-hidden">
              <img src={value} alt={label} className="w-full h-full object-cover" />
            </div>
          )}
        </div>
        {uploadError && <p className="text-red-500 text-sm mt-1">{uploadError}</p>}
        <p className="text-gray-500 text-sm mt-1">Maximum file size: 1.5MB</p>
        {value && (
          <input 
            type="text" 
            value={tempFiles.some(f => f.path === fieldName) ? "Image selected (will be uploaded on submission)" : value} 
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
    const path = `${arrayName}[${index}].${fieldName}`;
    const value = getValue(formData, path);
    const fileInputRef = React.useRef<HTMLInputElement>(null);
    
    return (
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">{label}</label>
        <div className="flex items-center gap-2">
          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            onChange={handleArrayImageSelection(arrayName, index, fieldName)}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded"
            aria-label={`Upload ${label} for item ${index + 1}`}
          >
            Select Image
          </button>
          {value && (
            <div className="relative w-16 h-16 border rounded overflow-hidden">
              <img src={value} alt={label} className="w-full h-full object-cover" />
            </div>
          )}
        </div>
        {uploadError && <p className="text-red-500 text-sm mt-1">{uploadError}</p>}
        <p className="text-gray-500 text-sm mt-1">Maximum file size: 1.5MB</p>
        {value && (
          <input 
            type="text" 
            value={tempFiles.some(f => f.path === path) ? "Image selected (will be uploaded on submission)" : value} 
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
  
  // These functions are now used with CldUploadWidget if still needed
  const handleImageUpload = (fieldPath: string) => (result: CloudinaryUploadWidgetResults) => {
    if (result.event !== 'success') return;
    
    const info = result.info as { secure_url: string };
    console.log(`Cloudinary direct upload for ${fieldPath}: ${info.secure_url}`);
    
    // No need to store in tempFiles since it's already in Cloudinary
    setFormData(prev => {
      const newFormData = cloneDeep(prev);
      set(newFormData, fieldPath, info.secure_url);
      return newFormData;
    });
  };
  
  const handleArrayImageUpload = (arrayName: string, index: number, fieldName: string) => (result: CloudinaryUploadWidgetResults) => {
    if (result.event !== 'success') return;
    
    const info = result.info as { secure_url: string };
    const path = `${arrayName}[${index}].${fieldName}`;
    console.log(`Cloudinary direct upload for ${path}: ${info.secure_url}`);
    
    // No need to store in tempFiles since it's already in Cloudinary
    setFormData(prev => {
      const newFormData = cloneDeep(prev);
      set(newFormData, path, info.secure_url);
      return newFormData;
    });
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