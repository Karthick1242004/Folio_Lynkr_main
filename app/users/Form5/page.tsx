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
    initial: string;
    email: string;
    designation: string;
    tagline: string;
    about: string;
    profileImage: string;
  };
  stats: {
    experience: string;
    clients: string;
    projects: string;
    developmentHours: string;
  };
  projects: Array<{
    title: string;
    year: string;
    image: string;
    description: string;
    category: string;
    visitLink: string;
  }>;
  skills: string[];
  careerHistory: Array<{
    title: string;
    company: string;
    period: string;
    description: string;
  }>;
  faqs: Array<{
    question: string;
    answer: string;
  }>;
  social: {
    twitter: string;
    instagram: string;
    linkedin: string;
    behance: string;
  };
  footer: {
    copyright: string;
    creator: string;
    technology: string;
  };
  subdomain: string;
  repo_name: {
    repo: string;
  };
}

function Page() {
  const { data: session } = useSession();
  const { subdomain, availability, loading, setSubdomain, setAvailability, setLoading, isPaymentComplete } = useStore();
  const [currentStep, setCurrentStep] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedStep = sessionStorage.getItem('form5_currentStep');
      return savedStep ? parseInt(savedStep) : 1;
    }
    return 1;
  });
  const [isNavOpen, setIsNavOpen] = useState(false);
  const totalSteps = 7;
  const [formData, setFormData] = useState<FormDataType>(() => {
    if (typeof window !== 'undefined') {
      const savedFormData = sessionStorage.getItem('form5_formData');
      const savedSubdomain = sessionStorage.getItem('form5_subdomain');
      
      if (savedSubdomain) {
        setSubdomain(savedSubdomain);
      }
      
      return savedFormData ? JSON.parse(savedFormData) : {
        personalInfo: {
          name: '',
          initial: '',
          email: '',
          designation: '',
          tagline: '',
          about: '',
          profileImage: '',
        },
        stats: {
          experience: '',
          clients: '',
          projects: '',
          developmentHours: '',
        },
        projects: Array(4).fill(null).map(() => ({
          title: '',
          year: '',
          image: '',
          description: '',
          category: '',
          visitLink: '',
        })),
        skills: Array(6).fill(''),
        careerHistory: Array(3).fill(null).map(() => ({
          title: '',
          company: '',
          period: '',
          description: '',
        })),
        faqs: Array(4).fill(null).map(() => ({
          question: '',
          answer: '',
        })),
        social: {
          twitter: '',
          instagram: '',
          linkedin: '',
          behance: '',
        },
        footer: {
          copyright: '',
          creator: '',
          technology: '',
        },
        subdomain: '',
        repo_name: {
          repo: 'framer_portfolio_folio',
        },
      };
    }
    return {
      // Default state structure
      personalInfo: {
        name: '',
        initial: '',
        email: '',
        designation: '',
        tagline: '',
        about: '',
        profileImage: '',
      },
      stats: {
        experience: '',
        clients: '',
        projects: '',
        developmentHours: '',
      },
      projects: Array(4).fill(null).map(() => ({
        title: '',
        year: '',
        image: '',
        description: '',
        category: '',
        visitLink: '',
      })),
      skills: Array(6).fill(''),
      careerHistory: Array(3).fill(null).map(() => ({
        title: '',
        company: '',
        period: '',
        description: '',
      })),
      faqs: Array(4).fill(null).map(() => ({
        question: '',
        answer: '',
      })),
      social: {
        twitter: '',
        instagram: '',
        linkedin: '',
        behance: '',
      },
      footer: {
        copyright: '',
        creator: '',
        technology: '',
      },
      subdomain: '',
      repo_name: {
        repo: 'framer_portfolio_folio',
      },
    };
  });
  const router = useRouter();

  // Get the steps for the Modern Portfolio
  const siteSteps = [
    { number: 1, title: "SITE DETAILS", description: "Enter your site details" },
    { number: 2, title: "PEROSNAL INFO", description: "Enter your personal information" },
    { number: 3, title: "PROJECTS", description: "Add your projects" },
    { number: 4, title: "CAREER HISTORY", description: "Add your work experience" },
    { number: 5, title: "FAQs", description: "Add frequently asked questions" },
    { number: 6, title: "SOCIAL LINKS", description: "Add your social media links" },
    { number: 7, title: "FOOTER", description: "Customize your footer" }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const newFormData = { ...prev };
      const keys = name.split('.');
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

  useEffect(() => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('form5_formData', JSON.stringify(formData));
      sessionStorage.setItem('form5_currentStep', currentStep.toString());
      if (subdomain) {
        sessionStorage.setItem('form5_subdomain', subdomain);
      }
    }
  }, [formData, currentStep, subdomain]);

  const clearSessionStorage = () => {
    sessionStorage.removeItem('form5_formData');
    sessionStorage.removeItem('form5_currentStep');
    sessionStorage.removeItem('form5_subdomain');
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (currentStep !== totalSteps) {
      return;
    }

    const { isPaymentComplete } = useStore.getState();

    if (!isPaymentComplete) {
      alert("Please complete the payment first");
      return;
    }

    if (!subdomain || !availability) {
      alert("Please enter and check the availability of the subdomain.");
      return;
    }

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
    const userEmail = session.user?.email || `${session.user.name}@github.com`;

    const data = {
      ...formData,
      subdomain,
    };

    try {
      const userToken = (session as any)?.accessToken;

      if (!userToken) {
        console.error('GitHub token not found in session');
        alert('Authentication error. Please try logging in again.');
        return;
      }

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

      const storePayload = {
        userId: userId,
        userEmail: userEmail,
        userName: session.user.name,
        subdomain: subdomain,
        gistUrl: gistRawUrl,
        siteName: 'Modern Portfolio'
      };

      const storeResponse = await fetch("https://folio4ubackend-production.up.railway.app/store-hosted-site", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(storePayload),
      });

      if (!storeResponse.ok) {
        const errorData = await storeResponse.json();
        throw new Error(errorData.message || "Failed to store site information");
      }

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

  const nextStep = () => {
    setCurrentStep((prev) => Math.min(prev + 1, totalSteps));
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleStepClick = (step: number) => {
    setCurrentStep(step);
  };

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
          title: '',
          year: '',
          image: '',
          description: '',
          category: '',
          visitLink: '',
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

  const addCareerHistory = () => {
    setFormData(prev => ({
      ...prev,
      careerHistory: [
        ...prev.careerHistory,
        {
          title: '',
          company: '',
          period: '',
          description: '',
        }
      ]
    }));
  };

  const removeCareerHistory = (index: number) => {
    setFormData(prev => ({
      ...prev,
      careerHistory: prev.careerHistory.filter((_, i) => i !== index)
    }));
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
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
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Personal Information</h2>
            <ImageUploadField 
              fieldName="personalInfo.profileImage"
              label="Profile Image"
            />
            <FormInput 
              type="text"
              name="personalInfo.name"
              label="Name"
              value={formData.personalInfo.name}
              onChange={handleInputChange}
              placeholder="Enter your name"
            />
            <FormInput 
              type="text"
              name="personalInfo.initial"
              label="Initial"
              value={formData.personalInfo.initial}
              onChange={handleInputChange}
              placeholder="Enter your initial"
            />
            <FormInput 
              type="email"
              name="personalInfo.email"
              label="Email"
              value={formData.personalInfo.email}
              onChange={handleInputChange}
              placeholder="Enter your email"
            />
            <FormInput 
              type="text"
              name="personalInfo.designation"
              label="Designation"
              value={formData.personalInfo.designation}
              onChange={handleInputChange}
              placeholder="Enter your designation"
            />
            <FormInput 
              type="text"
              name="personalInfo.tagline"
              label="Tagline"
              value={formData.personalInfo.tagline}
              onChange={handleInputChange}
              placeholder="Enter your tagline"
            />
            <FormInput 
              type="textarea"
              name="personalInfo.about"
              label="About"
              value={formData.personalInfo.about}
              onChange={handleInputChange}
              placeholder="Tell us about yourself"
              rows={4}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormInput 
                type="text"
                name="stats.experience"
                label="Experience"
                value={formData.stats.experience}
                onChange={handleInputChange}
                placeholder="e.g., 8+"
              />
              <FormInput 
                type="text"
                name="stats.clients"
                label="Clients"
                value={formData.stats.clients}
                onChange={handleInputChange}
                placeholder="e.g., 20+"
              />
              <FormInput 
                type="text"
                name="stats.projects"
                label="Projects"
                value={formData.stats.projects}
                onChange={handleInputChange}
                placeholder="e.g., 40+"
              />
              <FormInput 
                type="text"
                name="stats.developmentHours"
                label="Development Hours"
                value={formData.stats.developmentHours}
                onChange={handleInputChange}
                placeholder="e.g., 10,000+"
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4 !h-[370px] overflow-y-scroll">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Projects</h2>
              <button
                type="button"
                onClick={addProject}
                className="px-4 py-2 bg-[#574EFA] text-white rounded-lg hover:bg-[#4A3FF7]"
              >
                Add Project
              </button>
            </div>
            {formData.projects.map((_, index) => (
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
                <FormInput 
                  type="text"
                  name={`projects.${index}.title`}
                  label="Project Title"
                  value={formData.projects[index].title}
                  onChange={handleInputChange}
                  placeholder="Enter project title"
                />
                <FormInput 
                  type="text"
                  name={`projects.${index}.year`}
                  label="Year"
                  value={formData.projects[index].year}
                  onChange={handleInputChange}
                  placeholder="Enter project year"
                />
                <ImageUploadField 
                  fieldName={`projects.${index}.image`}
                  label="Project Image"
                />
                <FormInput 
                  type="textarea"
                  name={`projects.${index}.description`}
                  label="Description"
                  value={formData.projects[index].description}
                  onChange={handleInputChange}
                  placeholder="Enter project description"
                  rows={3}
                />
                <FormInput 
                  type="text"
                  name={`projects.${index}.category`}
                  label="Category"
                  value={formData.projects[index].category}
                  onChange={handleInputChange}
                  placeholder="Enter project category"
                />
                <FormInput 
                  type="url"
                  name={`projects.${index}.visitLink`}
                  label="Visit Link"
                  value={formData.projects[index].visitLink}
                  onChange={handleInputChange}
                  placeholder="Enter project URL"
                />
              </div>
            ))}
          </div>
        );

      case 4:
        return (
          <div className="space-y-4 !h-[370px] overflow-y-scroll">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Career History</h2>
              <button
                type="button"
                onClick={addCareerHistory}
                className="px-4 py-2 bg-[#574EFA] text-white rounded-lg hover:bg-[#4A3FF7]"
              >
                Add Experience
              </button>
            </div>
            {formData.careerHistory.map((_, index) => (
              <div key={index} className="space-y-2 p-4 border rounded relative">
                {formData.careerHistory.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeCareerHistory(index)}
                    className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                )}
                <FormInput 
                  type="text"
                  name={`careerHistory.${index}.title`}
                  label="Position Title"
                  value={formData.careerHistory[index].title}
                  onChange={handleInputChange}
                  placeholder="Enter position title"
                />
                <FormInput 
                  type="text"
                  name={`careerHistory.${index}.company`}
                  label="Company"
                  value={formData.careerHistory[index].company}
                  onChange={handleInputChange}
                  placeholder="Enter company name"
                />
                <FormInput 
                  type="text"
                  name={`careerHistory.${index}.period`}
                  label="Period"
                  value={formData.careerHistory[index].period}
                  onChange={handleInputChange}
                  placeholder="e.g., 2020 - 2022"
                />
                <FormInput 
                  type="textarea"
                  name={`careerHistory.${index}.description`}
                  label="Description"
                  value={formData.careerHistory[index].description}
                  onChange={handleInputChange}
                  placeholder="Enter job description"
                  rows={3}
                />
              </div>
            ))}
          </div>
        );

      case 5:
        return (
          <div className="space-y-4 !h-[370px] overflow-y-scroll">
            <h2 className="text-xl font-semibold">FAQs</h2>
            {formData.faqs.map((_, index) => (
              <div key={index} className="space-y-2 p-4 border rounded">
                <FormInput 
                  type="text"
                  name={`faqs.${index}.question`}
                  label="Question"
                  value={formData.faqs[index].question}
                  onChange={handleInputChange}
                  placeholder="Enter FAQ question"
                />
                <FormInput 
                  type="textarea"
                  name={`faqs.${index}.answer`}
                  label="Answer"
                  value={formData.faqs[index].answer}
                  onChange={handleInputChange}
                  placeholder="Enter FAQ answer"
                  rows={3}
                />
              </div>
            ))}
          </div>
        );

      case 6:
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Social Links</h2>
            <FormInput 
              type="url"
              name="social.twitter"
              label="Twitter URL"
              value={formData.social.twitter}
              onChange={handleInputChange}
              placeholder="Enter Twitter profile URL"
            />
            <FormInput 
              type="url"
              name="social.instagram"
              label="Instagram URL"
              value={formData.social.instagram}
              onChange={handleInputChange}
              placeholder="Enter Instagram profile URL"
            />
            <FormInput 
              type="url"
              name="social.linkedin"
              label="LinkedIn URL"
              value={formData.social.linkedin}
              onChange={handleInputChange}
              placeholder="Enter LinkedIn profile URL"
            />
            <FormInput 
              type="url"
              name="social.behance"
              label="Behance URL"
              value={formData.social.behance}
              onChange={handleInputChange}
              placeholder="Enter Behance profile URL"
            />
          </div>
        );

      case 7:
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Footer Information</h2>
            <FormInput 
              type="text"
              name="footer.copyright"
              label="Copyright Text"
              value={formData.footer.copyright}
              onChange={handleInputChange}
              placeholder="Enter copyright text"
            />
            <FormInput 
              type="text"
              name="footer.creator"
              label="Creator Name"
              value={formData.footer.creator}
              onChange={handleInputChange}
              placeholder="Enter creator name"
            />
            <FormInput 
              type="text"
              name="footer.technology"
              label="Technology Used"
              value={formData.footer.technology}
              onChange={handleInputChange}
              placeholder="Enter technology used"
            />
          </div>
        );

      default:
        return null;
    }
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
            onStepClick={handleStepClick}
            steps={siteSteps}
          />

          <div className="flex-1 max-w-2xl !min-h-[10%]">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-[#1A1E3C]">
                {siteSteps[currentStep - 1].title}
              </h1>
              <p className="text-gray-500 text-lg">
                {siteSteps[currentStep - 1].description}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-6">
                {renderStep()}
              </div>

              <div className="flex justify-between pt-8">
                {currentStep > 1 && (
                  <button
                    type="button"
                    onClick={prevStep}
                    className="px-6 py-3 text-[#574EFA] hover:text-[#4A3FF7] font-medium"
                  >
                    Go Back
                  </button>
                )}
                {currentStep < totalSteps ? (
                  <button
                    type="button"
                    onClick={nextStep}
                    className="ml-auto px-6 py-3 bg-[#1A1E3C] text-white rounded-lg hover:bg-[#2A2E4C] transition-colors"
                  >
                    Next Step
                  </button>
                ) : (
                  <div className="flex flex-col gap-4">
                    <Payment 
                      onSuccess={() => {
                        if (!subdomain) {
                          alert("Please enter a subdomain first");
                          return;
                        }
                        if (!availability || !availability.includes("is available")) {
                          alert("Please check subdomain availability first");
                          return;
                        }
                        
                        if (!session) {
                          signIn('github');
                          return;
                        }
                        const submitEvent = new Event('submit', {
                          bubbles: true,
                          cancelable: true,
                        }) as unknown as FormEvent<HTMLFormElement>;
                        setTimeout(() => handleSubmit(submitEvent), 100);
                      }} 
                      amount={499}
                    />
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

export default Page;
