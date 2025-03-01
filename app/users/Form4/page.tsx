"use client"
import React, { useState, FormEvent, useEffect } from 'react';
import { useStore } from '@/store/store';
import axios from 'axios';
import ProgressBar from '@/components/ProgreseBar/ProgreseBar';
import { FormInput } from '@/components/ProgreseBar/FormInput';
import { CldUploadWidget, CloudinaryUploadWidgetResults } from 'next-cloudinary';
import { useRouter } from 'next/navigation';
import Payment from '@/components/Payment/Payment';
import data from '@/Data/data.json';
import { useSession, signIn } from 'next-auth/react';
import Footer from '@/components/FormFooter/Footer';
import { PageNavigation } from '@/components/FormpageNav/PageNavigation';

interface FormDataType {
  personalInfo: {
    name: string;
    designation: string;
    about: string[];
    resumeLink: string;
  };
  education: Array<{
    institution: string;
    degree: string;
    score: string;
    duration: string;
  }>;
  contact: {
    email: string;
    phone: string;
    location: string;
    social: {
      github: string;
      linkedin: string;
    };
  };
  projects: Array<{
    id: number;
    image: string;
    content: string;
    demoLink: string;
    githubLink: string;
    isHovered: boolean;
  }>;
}

interface FormInputProps {
  type: "email" | "textarea" | "text" | "url" | "tel";
  name: string;
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  placeholder?: string;
}

function Form4() {
  const { data: session } = useSession();
  const { subdomain, availability, loading, setSubdomain, setAvailability, setLoading, isPaymentComplete } = useStore();
  const [currentStep, setCurrentStep] = useState(() => {
    // Initialize currentStep from sessionStorage or default to 1
    if (typeof window !== 'undefined') {
      const savedStep = sessionStorage.getItem('form4_currentStep');
      return savedStep ? parseInt(savedStep) : 1;
    }
    return 1;
  });
  const [isNavOpen, setIsNavOpen] = useState(false);
  const totalSteps = 4;
  
  // Initialize formData from sessionStorage or default values
  const [formData, setFormData] = useState<FormDataType>(() => {
    if (typeof window !== 'undefined') {
      const savedFormData = sessionStorage.getItem('form4_formData');
      const savedSubdomain = sessionStorage.getItem('form4_subdomain');
      
      if (savedSubdomain) {
        setSubdomain(savedSubdomain);
      }
      
      return savedFormData ? JSON.parse(savedFormData) : {
        personalInfo: {
          name: '',
          designation: '',
          about: ['', '', ''],
          resumeLink: '',
        },
        education: Array(3).fill(null).map(() => ({
          institution: '',
          degree: '',
          score: '',
          duration: '',
        })),
        contact: {
          email: '',
          phone: '',
          location: '',
          social: {
            github: '',
            linkedin: '',
          },
        },
        projects: Array(1).fill(null).map((_, index) => ({
          id: index + 1,
          image: '',
          content: '',
          demoLink: '',
          githubLink: '',
          isHovered: false,
        })),
      };
    }
    return {
      personalInfo: {
        name: '',
        designation: '',
        about: ['', '', ''],
        resumeLink: '',
      },
      education: Array(3).fill(null).map(() => ({
        institution: '',
        degree: '',
        score: '',
        duration: '',
      })),
      contact: {
        email: '',
        phone: '',
        location: '',
        social: {
          github: '',
          linkedin: '',
        },
      },
      projects: Array(1).fill(null).map((_, index) => ({
        id: index + 1,
        image: '',
        content: '',
        demoLink: '',
        githubLink: '',
        isHovered: false,
      })),
    };
  });

  // Save form data to sessionStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('form4_formData', JSON.stringify(formData));
      sessionStorage.setItem('form4_currentStep', currentStep.toString());
      if (subdomain) {
        sessionStorage.setItem('form4_subdomain', subdomain);
      }
    }
  }, [formData, currentStep, subdomain]);

  // Clear session storage after successful form submission
  const clearSessionStorage = () => {
    sessionStorage.removeItem('form4_formData');
    sessionStorage.removeItem('form4_currentStep');
    sessionStorage.removeItem('form4_subdomain');
  };

  const router = useRouter();

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const newFormData = { ...prev };
      const keys = name.split('.');  // Split the name by dots
      let current: Record<string, any> = newFormData;

      if (keys.length === 1) {
        return { ...prev, [name]: value };
      }

      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]];
      }
      current[keys[keys.length - 1]] = value;
      return newFormData;
    });
  };

  const handleSubmit = async () => {
    if (currentStep !== totalSteps) {
      return;
    }

    // Get the latest payment status directly from the store
    const { isPaymentComplete } = useStore.getState();

    if (!isPaymentComplete) {
      alert("Please complete the payment first");
      return;
    }

    if (!subdomain || !availability) {
      alert("Please enter and check the availability of the subdomain.");
      return;
    }

    // Check if user is logged in
    if (!session) {
      signIn('github');
      return;
    }

    if (!session?.user?.name) {
      console.error('User name not found in session:', session);
      alert('Authentication error. Please try logging in again.');
      return;
    }

    const userId = session.user.name;

    if (!userId) {
      console.error('User ID not found in session:', session);
      alert('Authentication error. Please try logging in again.');
      return;
    }

    // If email is missing, use a default format
    const userEmail = session.user?.email || `${session.user.name}@github.com`;

    const data = {
      ...formData,
      subdomain,
      repo_name: {
        repo: 'shadcn_bento_folio' // Changed repo name for Form4
      }
    };

    try {
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
        siteName: 'Image Gallery Portfolio' // Changed site name for Form4
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
          repoName: data.repo_name.repo
        }),
      });

      if (!updateGistUrlResponse.ok) {
        throw new Error("Failed to update the Gist URL");
      }

      // After successful submission, clear the session storage
      clearSessionStorage();
      router.push('/users/pipeline');
    } catch (error) {
      console.error("Error during submission:", error);
      alert("An error occurred. Please try again.");
    }
  };

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

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <FormInput
              label="Site Title"
              name="personalInfo.name"
              value={formData.personalInfo.name}
              onChange={handleInputChange}
              placeholder="Enter your name"
              type="text"
            />
            <FormInput
              label="Designation"
              name="personalInfo.designation"
              value={formData.personalInfo.designation}
              onChange={handleInputChange}
              placeholder="Enter your designation"
              type="text"
            />
            <FormInput
              label="Resume Link"
              name="personalInfo.resumeLink"
              value={formData.personalInfo.resumeLink}
              onChange={handleInputChange}
              placeholder="Enter your resume link"
              type="url"
            />
            <FormInput
              label="Subdomain"
              name="subdomain"
              value={subdomain}
              onChange={(e) => setSubdomain(e.target.value)}
              placeholder="Enter subdomain"
              type="text"
            />
            <button
              onClick={checkAvailability}
              disabled={loading}
              className="w-full mt-2 px-6 py-3 bg-[#574EFA] text-white rounded-lg hover:bg-[#4A3FF7] disabled:bg-gray-300 transition-colors"
              type="button"
            >
              {loading ? 'Checking...' : 'Check Availability'}
            </button>
            {availability && (
              <p className="mt-2 text-sm text-gray-600">{availability}</p>
            )}
          </div>
        );
      case 2:
        return (
          <div>
            <h2>Education</h2>
            {formData.education.map((edu, index) => (
              <div key={index}>
                <FormInput
                  label="Institution"
                  name={`education.${index}.institution`}
                  value={edu.institution}
                  onChange={handleInputChange}
                  placeholder="Enter institution name"
                  type="text"
                />
                <FormInput
                  label="Degree"
                  name={`education.${index}.degree`}
                  value={edu.degree}
                  onChange={handleInputChange}
                  placeholder="Enter degree"
                  type="text"
                />
                <FormInput
                  label="Score"
                  name={`education.${index}.score`}
                  value={edu.score}
                  onChange={handleInputChange}
                  placeholder="Enter score"
                  type="text"
                />
                <FormInput
                  label="Duration"
                  name={`education.${index}.duration`}
                  value={edu.duration}
                  onChange={handleInputChange}
                  placeholder="Enter duration"
                  type="text"
                />
              </div>
            ))}
          </div>
        );
      case 3:
        return (
          <div>
            <h2>Contact Information</h2>
            <FormInput
              label="Email"
              name="contact.email"
              value={formData.contact.email}
              onChange={handleInputChange}
              placeholder="Enter your email"
              type="email"
            />
            <FormInput
              label="Phone"
              name="contact.phone"
              value={formData.contact.phone}
              onChange={handleInputChange}
              placeholder="Enter your phone number"
              type="text"
            />
            <FormInput
              label="Location"
              name="contact.location"
              value={formData.contact.location}
              onChange={handleInputChange}
              placeholder="Enter your location"
              type="text"
            />
            <FormInput
              label="GitHub URL"
              name="contact.social.github"
              value={formData.contact.social.github}
              onChange={handleInputChange}
              placeholder="Enter your GitHub URL"
              type="url"
            />
            <FormInput
              label="LinkedIn URL"
              name="contact.social.linkedin"
              value={formData.contact.social.linkedin}
              onChange={handleInputChange}
              placeholder="Enter your LinkedIn URL"
              type="url"
            />
          </div>
        );
      case 4:
        return (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Projects</h2>
              <button
                type="button"
                onClick={addProject}
                className="px-4 py-2 bg-[#574EFA] text-white rounded-lg hover:bg-[#4A3FF7]"
              >
                Add Project
              </button>
            </div>
            <div className="space-y-6 !h-[370px] overflow-y-scroll">
              {formData.projects.map((project, index) => (
                <div key={index} className="space-y-2 p-4 border rounded relative">
                  {formData.projects.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeProject(index)}
                      className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  )}
                  <ImageUploadField
                    fieldName={`projects.${index}.image`}
                    label={`Project ${index + 1} Image`}
                  />
                  <FormInput
                    label="Project Content"
                    name={`projects.${index}.content`}
                    value={project.content}
                    onChange={handleInputChange}
                    placeholder="Enter project description"
                    type="textarea"
                  />
                  <FormInput
                    label="Demo Link"
                    name={`projects.${index}.demoLink`}
                    value={project.demoLink}
                    onChange={handleInputChange}
                    placeholder="Enter demo link"
                    type="url"
                  />
                  <FormInput
                    label="GitHub Link"
                    name={`projects.${index}.githubLink`}
                    value={project.githubLink}
                    onChange={handleInputChange}
                    placeholder="Enter GitHub link"
                    type="url"
                  />
                </div>
              ))}
            </div>
          </div>
        );
      // Add more steps as needed
      default:
        return null;
    }
  };

  // Add ImageUploadField component after handleInputChange
  const ImageUploadField = ({ fieldName, label }: { fieldName: string; label: string }) => {
    return (
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">{label}</label>
        <div className="flex flex-col gap-2">
          <CldUploadWidget 
            options={{ 
              cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
              uploadPreset: 'my_uploads'
            }}
            onSuccess={(result: any) => {
              if (result.info && typeof result.info === 'object' && 'secure_url' in result.info) {
                handleImageUpload(fieldName)(result);
              }
            }}
          >
            {({ open }) => (
              <button onClick={() => open()} type="button" className="w-full px-4 py-2 border border-gray-300 rounded-md">
                Upload Image
              </button>
            )}
          </CldUploadWidget>

          {getValue(formData, fieldName) && (
            <div className="relative w-12 h-12">
              <img
                src={getValue(formData, fieldName)}
                alt={`${label} preview`}
                className="w-full h-full object-cover rounded-md"
              />
            </div>
          )}
        </div>
      </div>
    );
  };

  // Add helper functions
  const handleImageUpload = (fieldName: string) => (result: CloudinaryUploadWidgetResults) => {
    if (result.info && typeof result.info === 'object' && 'secure_url' in result.info) {
      const imageUrl = result.info.secure_url;
      setFormData(prev => {
        const newFormData = { ...prev };
        const keys = fieldName.split('.');
        let current: Record<string, any> = newFormData;
        
        for (let i = 0; i < keys.length - 1; i++) {
          if (keys[i].match(/^\d+$/)) {
            current = current[parseInt(keys[i])];
          } else {
            current = current[keys[i]];
          }
        }
        
        current[keys[keys.length - 1]] = imageUrl;
        return newFormData;
      });
    }
  };

  const getValue = (obj: FormDataType, path: string): string => {
    return path.split('.').reduce((acc: any, part) => {
      if (acc && typeof acc === 'object') {
        return acc[part];
      }
      return '';
    }, formData);
  };

  const addProject = () => {
    setFormData(prev => ({
      ...prev,
      projects: [
        ...prev.projects,
        {
          id: prev.projects.length + 1,
          image: '',
          content: '',
          demoLink: '',
          githubLink: '',
          isHovered: false,
        }
      ]
    }));
  };

  const removeProject = (index: number) => {
    setFormData(prev => ({
      ...prev,
      projects: prev.projects.filter((_, i) => i !== index)
    }));
  };

  return (
    <div className="min-h-screen bg-[#F0F0F0] p-4 md:p-8">
      <PageNavigation
        isOpen={isNavOpen}
        onClose={() => setIsNavOpen(true)}
      />
      <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-lg p-4 md:p-8">
        <div className="flex flex-col md:flex-row gap-8">
          <ProgressBar
            currentStep={currentStep}
            totalSteps={totalSteps}
            onStepClick={(step) => setCurrentStep(step)}
            steps={data.sites[3].steps} // Adjust based on your data
          />
          <div className="flex-1 max-w-2xl !min-h-[10%]">
            <h1 className="text-3xl font-bold text-[#1A1E3C]">
              {currentStep === 1 && "Personal Information"}
              {currentStep === 2 && "Education"}
              {currentStep === 3 && "Contact Information"}
              {currentStep === 4 && "Projects"}
              {/* Add more titles for additional steps */}
            </h1>
            <form onSubmit={handleSubmit} className="space-y-8">
              {renderStep()}
              <div className="flex justify-between pt-8">
                {currentStep > 1 && (
                  <button
                    type="button"
                    onClick={() => setCurrentStep((prev) => Math.max(prev - 1, 1))}
                    className="px-6 py-3 text-[#574EFA] hover:text-[#4A3FF7] font-medium"
                  >
                    Go Back
                  </button>
                )}
                {currentStep < totalSteps ? (
                  <button
                    type="button"
                    onClick={() => setCurrentStep((prev) => Math.min(prev + 1, totalSteps))}
                    className="ml-auto px-6 py-3 bg-[#1A1E3C] text-white rounded-lg hover:bg-[#2A2E4C] transition-colors"
                  >
                    Next Step
                  </button>
                ) : (
                  <Payment
                    onSuccess={handleSubmit}
                    amount={699} // Adjust based on your pricing
                  />
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

export default Form4;
