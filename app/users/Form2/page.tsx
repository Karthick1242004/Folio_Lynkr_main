// Form2
"use client"
import React, { useState, FormEvent } from 'react';
import { useStore } from '@/store/store';
import axios from 'axios';
import ProgressBar from '@/components/ProgreseBar/ProgreseBar';
import { FormInput } from '@/components/ProgreseBar/FormInput';
import { CldUploadWidget, CloudinaryUploadWidgetResults } from 'next-cloudinary';
import { useRouter } from 'next/navigation';
import Payment from '@/components/Payment/Payment';
import data from '@/Data/data.json';
import { useSession, signIn } from 'next-auth/react'
import Footer from '@/components/FormFooter/Footer';
import { PageNavigation } from '@/components/FormpageNav/PageNavigation';

interface FormDataType {
  projects: Array<{
    projectName: string;
    projectType: string;
    projectContent: string;
    projectImage: string;
    projectUrl: string;
    githubUrl: string;
  }>;
  top_project: {
    title: string;
    description: string;
    websiteUrl: string;
    websiteDisplay: string;
  };
  repo_name: {
    repo: string;
  }
  contacts: Array<{
    id: number;
    name: string;
    designation: string;
    url: string;
  }>;
  services: Array<{
    title: string;
    description: string;
  }>;
  skillset: {
    image: string;
  };
  hero: {
    name: string;
    tagline: string;
    resumeUrl: string;
    resumeText: string;
  };
  testimonials: Array<{
    id: number;
    name: string;
    designation: string;
    content: string;
  }>;
}

function Page() {
  const { subdomain, availability, loading, setSubdomain, setAvailability, setLoading, isPaymentComplete } = useStore();
  const [currentStep, setCurrentStep] = useState(1);
  const [isNavOpen, setIsNavOpen] = useState(false);
  const totalSteps = 8;
  
  // Get the steps for the second site (3D Interactive Portfolio)
  const siteSteps = data.sites[1].steps;
  
  const site_name = '3D Interactive Portfolio';
  
  const [formData, setFormData] = useState<FormDataType>({
    projects: Array(3).fill(null).map(() => ({
      projectName: '',
      projectType: '',
      projectContent: '',
      projectImage: '',
      projectUrl: '',
      githubUrl: '',
    })),
    top_project: {
      title: '',
      description: '',
      websiteUrl: '',
      websiteDisplay: '',
    },
    repo_name: {
      repo: 'Ace_portfolio_lynkr',
    },
    contacts: Array(3).fill(null).map((_, index) => ({
      id: index + 1,
      name: '',
      designation: '',
      url: '',
    })),
    services: Array(3).fill(null).map(() => ({
      title: '',
      description: '',
    })),
    skillset: {
      image: '',
    },
    hero: {
      name: '',
      tagline: '',
      resumeUrl: '',
      resumeText: '',
    },
    testimonials: Array(3).fill(null).map((_, index) => ({
      id: index,
      name: '',
      designation: '',
      content: '',
    })),
  });

  const router = useRouter();
  const { data: session } = useSession();

  // Reuse the same helper functions
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

  // Reuse the same submission logic
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

    // Check if user is logged in
    if (!session?.user?.name) {
      signIn('github');
      return;
    }

    // Use GitHub username and fallback email
    const userId = session.user.name;
    const userEmail = session.user?.email || `${session.user.name}@github.com`;

    const data = {
      ...formData,
      subdomain,
    };

    try {
      // Get GitHub token from session
      const userToken = (session as any)?.accessToken;

      if (!userToken) {
        console.error('GitHub token not found in session');
        alert('Authentication error. Please try logging in again.');
        return;
      }

      // Create Gist with token
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
        siteName: site_name
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

      // Added: Update the Gist URL in the repository
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

      router.push('/users/pipeline');
      
    } catch (error) {
      console.error("Error during submission:", error);
      alert("An error occurred. Please try again.");
    }
  };

  // Reuse availability check
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

  // Navigation functions
  const nextStep = () => setCurrentStep((prev) => Math.min(prev + 1, totalSteps));
  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 1));
  const handleStepClick = (step: number) => setCurrentStep(step);

  // Image upload handling
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

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <FormInput
              label="Site Title"
              name="top_project.title"
              value={formData.top_project.title}
              onChange={handleInputChange}
              placeholder="Enter your site title"
              type="text"
            />
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
            <h2 className="text-xl font-semibold">Hero Section</h2>
            <FormInput 
              type="text" 
              name="hero.name"
              label="Name"
              value={formData.hero.name}
              onChange={handleInputChange}
              placeholder="Enter your name" 
            />
            <FormInput 
              type="text" 
              name="hero.tagline"
              label="Tagline"
              value={formData.hero.tagline}
              onChange={handleInputChange}
              placeholder="Enter your tagline" 
            />
            <FormInput 
              type="url" 
              name="hero.resumeUrl"
              label="Resume URL"
              value={formData.hero.resumeUrl}
              onChange={handleInputChange}
              placeholder="Enter your resume URL" 
            />
            <FormInput 
              type="text" 
              name="hero.resumeText"
              label="Resume Button Text"
              value={formData.hero.resumeText}
              onChange={handleInputChange}
              placeholder="Enter resume button text" 
            />
          </div>
        );

      case 3:
        return (
          <div className="space-y-4 !h-[370px] overflow-y-scroll">
            <h2 className="text-xl font-semibold">Projects</h2>
            {formData.projects.map((_, index) => (
              <div key={index} className="space-y-2 p-4 border rounded">
                <FormInput 
                  type="text" 
                  name={`projects.${index}.projectName`}
                  label="Project Name"
                  value={formData.projects[index].projectName}
                  onChange={handleInputChange}
                  placeholder="Enter project name" 
                />
                <FormInput 
                  type="text" 
                  name={`projects.${index}.projectType`}
                  label="Project Type"
                  value={formData.projects[index].projectType}
                  onChange={handleInputChange}
                  placeholder="Enter project type" 
                />
                <FormInput 
                  type="textarea" 
                  name={`projects.${index}.projectContent`}
                  label="Project Description"
                  value={formData.projects[index].projectContent}
                  onChange={handleInputChange}
                  placeholder="Enter project description"
                  rows={3} 
                />
                <ImageUploadField 
                  fieldName={`projects.${index}.projectImage`}
                  label="Project Image"
                />
                <FormInput 
                  type="url" 
                  name={`projects.${index}.projectUrl`}
                  label="Project URL"
                  value={formData.projects[index].projectUrl}
                  onChange={handleInputChange}
                  placeholder="Enter project URL" 
                />
                <FormInput 
                  type="url" 
                  name={`projects.${index}.githubUrl`}
                  label="GitHub URL"
                  value={formData.projects[index].githubUrl}
                  onChange={handleInputChange}
                  placeholder="Enter GitHub URL" 
                />
              </div>
            ))}
          </div>
        );

      case 4:
        return (
          <div className="space-y-4 !h-[370px] overflow-y-scroll">
            <h2 className="text-xl font-semibold">Services</h2>
            {formData.services.map((_, index) => (
              <div key={index} className="space-y-2 p-4 border rounded">
                <FormInput 
                  type="text" 
                  name={`services.${index}.title`}
                  label="Service Title"
                  value={formData.services[index].title}
                  onChange={handleInputChange}
                  placeholder="Enter service title" 
                />
                <FormInput 
                  type="textarea" 
                  name={`services.${index}.description`}
                  label="Service Description"
                  value={formData.services[index].description}
                  onChange={handleInputChange}
                  placeholder="Enter service description"
                  rows={3} 
                />
              </div>
            ))}
          </div>
        );

      case 5:
        return (
          <div className="space-y-4 !h-[370px] overflow-y-scroll">
            <h2 className="text-xl font-semibold">Testimonials</h2>
            {formData.testimonials.map((_, index) => (
              <div key={index} className="space-y-2 p-4 border rounded">
                <FormInput 
                  type="text" 
                  name={`testimonials.${index}.name`}
                  label="Name"
                  value={formData.testimonials[index].name}
                  onChange={handleInputChange}
                  placeholder="Enter testimonial author name" 
                />
                <FormInput 
                  type="text" 
                  name={`testimonials.${index}.designation`}
                  label="Designation"
                  value={formData.testimonials[index].designation}
                  onChange={handleInputChange}
                  placeholder="Enter author designation" 
                />
                <FormInput 
                  type="textarea" 
                  name={`testimonials.${index}.content`}
                  label="Content"
                  value={formData.testimonials[index].content}
                  onChange={handleInputChange}
                  placeholder="Enter testimonial content"
                  rows={3} 
                />
              </div>
            ))}
          </div>
        );

      case 6:
        return (
          <div className="space-y-4 !h-[370px] overflow-y-scroll">
            <h2 className="text-xl font-semibold">Contacts</h2>
            {formData.contacts.map((_, index) => (
              <div key={index} className="space-y-2 p-4 border rounded">
                <FormInput 
                  type="text" 
                  name={`contacts.${index}.name`}
                  label="Contact Name"
                  value={formData.contacts[index].name}
                  onChange={handleInputChange}
                  placeholder="Enter contact name" 
                />
                <FormInput 
                  type="text" 
                  name={`contacts.${index}.designation`}
                  label="Designation"
                  value={formData.contacts[index].designation}
                  onChange={handleInputChange}
                  placeholder="Enter designation" 
                />
                <FormInput 
                  type="url" 
                  name={`contacts.${index}.url`}
                  label="Contact URL"
                  value={formData.contacts[index].url}
                  onChange={handleInputChange}
                  placeholder="Enter contact URL" 
                />
              </div>
            ))}
          </div>
        );

      case 7:
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Top Project</h2>
            <FormInput 
              type="text" 
              name="top_project.title"
              label="Project Title"
              value={formData.top_project.title}
              onChange={handleInputChange}
              placeholder="Enter project title" 
            />
            <FormInput 
              type="textarea" 
              name="top_project.description"
              label="Project Description"
              value={formData.top_project.description}
              onChange={handleInputChange}
              placeholder="Enter project description"
              rows={3} 
            />
            <FormInput 
              type="url" 
              name="top_project.websiteUrl"
              label="Website URL"
              value={formData.top_project.websiteUrl}
              onChange={handleInputChange}
              placeholder="Enter website URL" 
            />
            <FormInput 
              type="text" 
              name="top_project.websiteDisplay"
              label="Website Display Text"
              value={formData.top_project.websiteDisplay}
              onChange={handleInputChange}
              placeholder="Enter website display text" 
            />
          </div>
        );

      case 8:
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Skillset</h2>
            <ImageUploadField 
              fieldName="skillset.image"
              label="Skillset Image"
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
        onClose={() => setIsNavOpen(false)} 
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
                {currentStep === 1 && "Site Details"}
                {currentStep === 2 && "Hero Section"}
                {currentStep === 3 && "Projects"}
                {currentStep === 4 && "Services"}
                {currentStep === 5 && "Testimonials"}
                {currentStep === 6 && "Contacts"}
                {currentStep === 7 && "Top Project"}
                {currentStep === 8 && "Skillset"}
              </h1>
              <p className="text-gray-500 text-lg">
                Please provide all the required information for this section.
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
                  <Payment 
                    onSuccess={() => {
                      const submitEvent = new Event('submit', {
                        bubbles: true,
                        cancelable: true,
                      }) as unknown as FormEvent<HTMLFormElement>;
                      setTimeout(() => handleSubmit(submitEvent), 100);
                    }} 
                    amount={499}
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

export default Page;
