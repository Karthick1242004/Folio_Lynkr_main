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

interface UserProfileData {
  name: string;
  avatar: string;
  websites: {
    favorites: {
      title: string;
      sites: Array<{
        id: string;
        title: string;
        img: string;
        link: string;
      }>;
    };
    freq: {
      title: string;
      sites: Array<{
        id: string;
        title: string;
        img: string;
        link: string;
      }>;
    };
  };
  about: {
    name: string;
    bio: string[];
    education: string;
    interests: string;
    hobbies: string;
    contact: {
      email: string;
      github: string;
      linkedin: string;
    };
  };
  notes: Array<{
    id: string;
    title: string;
    icon: string;
    md: Array<{
      id: string;
      title: string;
      file: string;
      icon: string;
      excerpt: string;
      link?: string;
    }>;
  }>;
  repo_name: {
    repo: string;
  };
}

function Page() {
  const { subdomain, availability, loading, setSubdomain, setAvailability, setLoading, isPaymentComplete } = useStore();
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;
  const [formData, setFormData] = useState<UserProfileData>({
    name: '',
    avatar: '',
    websites: {
      favorites: {
        title: 'Favorites',
        sites: Array(4).fill(null).map(() => ({
          id: '',
          title: '',
          img: '',
          link: ''
        }))
      },
      freq: {
        title: 'Frequently Visited',
        sites: Array(8).fill(null).map(() => ({
          id: '',
          title: '',
          img: '',
          link: ''
        }))
      }
    },
    about: {
      name: '',
      bio: ['', '', ''],
      education: '',
      interests: '',
      hobbies: '',
      contact: {
        email: '',
        github: '',
        linkedin: ''
      }
    },
    notes: [
      {
        id: 'profile',
        title: 'Profile',
        icon: 'BsFolder2',
        md: Array(2).fill(null).map(() => ({
          id: '',
          title: '',
          file: '',
          icon: '',
          excerpt: ''
        }))
      },
      {
        id: 'project',
        title: 'Projects',
        icon: 'BsFolder2',
        md: Array(2).fill(null).map(() => ({
          id: '',
          title: '',
          file: '',
          icon: '',
          excerpt: '',
          link: ''
        }))
      }
    ],
    repo_name: {
      repo: 'macOS_portfolio_new'
    }
  });

  const router = useRouter();
  const siteSteps = data.sites[2].steps;

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
        if (keys[i].match(/^\d+$/)) {
          current = current[parseInt(keys[i])];
        } else {
          current = current[keys[i]];
        }
      }
      current[keys[keys.length - 1]] = value;
      return newFormData;
    });
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

    const data = {
      ...formData,
      subdomain,
    };

    try {
      const createGistResponse = await fetch("https://folio4ubackend-production.up.railway.app/create-gist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: JSON.stringify(data, null, 2) }),
      });

      if (!createGistResponse.ok) {
        const errorData = await createGistResponse.json();
        throw new Error(errorData.message || "Failed to create the Gist");
      }

      const { gistRawUrl } = await createGistResponse.json();

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
        const errorData = await updateGistUrlResponse.json();
        throw new Error(errorData.message || "Failed to update the Gist URL");
      }

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

  const getValue = (obj: UserProfileData, path: string): string => {
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
              label="Name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Enter your name"
              type="text"
            />
            <ImageUploadField
              fieldName="avatar"
              label="Profile Image"
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
          <div className="space-y-4 !h-[370px] overflow-y-scroll">
            <h2 className="text-xl font-semibold">Websites</h2>
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-4">Favorite Sites</h3>
                {formData.websites.favorites.sites.map((_, index) => (
                  <div key={index} className="space-y-2 p-4 border rounded mb-4">
                    <FormInput
                      type="text"
                      name={`websites.favorites.sites.${index}.id`}
                      label="Site ID"
                      value={formData.websites.favorites.sites[index].id}
                      onChange={handleInputChange}
                      placeholder="Enter site ID"
                    />
                    <FormInput
                      type="text"
                      name={`websites.favorites.sites.${index}.title`}
                      label="Site Title"
                      value={formData.websites.favorites.sites[index].title}
                      onChange={handleInputChange}
                      placeholder="Enter site title"
                    />
                    <ImageUploadField
                      fieldName={`websites.favorites.sites.${index}.img`}
                      label="Site Image"
                    />
                    <FormInput
                      type="url"
                      name={`websites.favorites.sites.${index}.link`}
                      label="Site URL"
                      value={formData.websites.favorites.sites[index].link}
                      onChange={handleInputChange}
                      placeholder="Enter site URL"
                    />
                  </div>
                ))}
              </div>
              <div>
                <h3 className="text-lg font-medium mb-4">Frequently Visited Sites</h3>
                {formData.websites.freq.sites.map((_, index) => (
                  <div key={index} className="space-y-2 p-4 border rounded mb-4">
                    <FormInput
                      type="text"
                      name={`websites.freq.sites.${index}.id`}
                      label="Site ID"
                      value={formData.websites.freq.sites[index].id}
                      onChange={handleInputChange}
                      placeholder="Enter site ID"
                    />
                    <FormInput
                      type="text"
                      name={`websites.freq.sites.${index}.title`}
                      label="Site Title"
                      value={formData.websites.freq.sites[index].title}
                      onChange={handleInputChange}
                      placeholder="Enter site title"
                    />
                    <ImageUploadField
                      fieldName={`websites.freq.sites.${index}.img`}
                      label="Site Image"
                    />
                    <FormInput
                      type="url"
                      name={`websites.freq.sites.${index}.link`}
                      label="Site URL"
                      value={formData.websites.freq.sites[index].link}
                      onChange={handleInputChange}
                      placeholder="Enter site URL"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">About Section</h2>
            <FormInput
              type="text"
              name="about.name"
              label="Full Name"
              value={formData.about.name}
              onChange={handleInputChange}
              placeholder="Enter your full name"
            />
            {formData.about.bio.map((_, index) => (
              <FormInput
                key={index}
                type="textarea"
                name={`about.bio.${index}`}
                label={`Bio Part ${index + 1}`}
                value={formData.about.bio[index]}
                onChange={handleInputChange}
                placeholder={`Enter bio part ${index + 1}`}
                rows={3}
              />
            ))}
            <FormInput
              type="text"
              name="about.education"
              label="Education"
              value={formData.about.education}
              onChange={handleInputChange}
              placeholder="Enter your education details"
            />
            <FormInput
              type="text"
              name="about.interests"
              label="Interests"
              value={formData.about.interests}
              onChange={handleInputChange}
              placeholder="Enter your interests"
            />
            <FormInput
              type="text"
              name="about.hobbies"
              label="Hobbies"
              value={formData.about.hobbies}
              onChange={handleInputChange}
              placeholder="Enter your hobbies"
            />
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Contact Information</h3>
              <FormInput
                type="email"
                name="about.contact.email"
                label="Email"
                value={formData.about.contact.email}
                onChange={handleInputChange}
                placeholder="Enter your email"
              />
              <FormInput
                type="url"
                name="about.contact.github"
                label="GitHub URL"
                value={formData.about.contact.github}
                onChange={handleInputChange}
                placeholder="Enter your GitHub URL"
              />
              <FormInput
                type="url"
                name="about.contact.linkedin"
                label="LinkedIn URL"
                value={formData.about.contact.linkedin}
                onChange={handleInputChange}
                placeholder="Enter your LinkedIn URL"
              />
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-4 !h-[370px] overflow-y-scroll">
            <h2 className="text-xl font-semibold">Notes</h2>
            {formData.notes.map((section, sectionIndex) => (
              <div key={section.id} className="space-y-4 p-4 border rounded">
                <h3 className="text-lg font-medium">{section.title}</h3>
                {section.md.map((_, noteIndex) => (
                  <div key={noteIndex} className="space-y-2 p-4 border rounded">
                    <FormInput
                      type="text"
                      name={`notes.${sectionIndex}.md.${noteIndex}.id`}
                      label="Note ID"
                      value={formData.notes[sectionIndex].md[noteIndex].id}
                      onChange={handleInputChange}
                      placeholder="Enter note ID"
                    />
                    <FormInput
                      type="text"
                      name={`notes.${sectionIndex}.md.${noteIndex}.title`}
                      label="Note Title"
                      value={formData.notes[sectionIndex].md[noteIndex].title}
                      onChange={handleInputChange}
                      placeholder="Enter note title"
                    />
                    <FormInput
                      type="text"
                      name={`notes.${sectionIndex}.md.${noteIndex}.file`}
                      label="File Path"
                      value={formData.notes[sectionIndex].md[noteIndex].file}
                      onChange={handleInputChange}
                      placeholder="Enter file path"
                    />
                    <FormInput
                      type="text"
                      name={`notes.${sectionIndex}.md.${noteIndex}.icon`}
                      label="Icon"
                      value={formData.notes[sectionIndex].md[noteIndex].icon}
                      onChange={handleInputChange}
                      placeholder="Enter icon name"
                    />
                    <FormInput
                      type="textarea"
                      name={`notes.${sectionIndex}.md.${noteIndex}.excerpt`}
                      label="Excerpt"
                      value={formData.notes[sectionIndex].md[noteIndex].excerpt}
                      onChange={handleInputChange}
                      placeholder="Enter excerpt"
                      rows={3}
                    />
                    {section.id === 'project' && (
                      <FormInput
                        type="url"
                        name={`notes.${sectionIndex}.md.${noteIndex}.link`}
                        label="Project Link"
                        value={formData.notes[sectionIndex].md[noteIndex].link || ''}
                        onChange={handleInputChange}
                        placeholder="Enter project link"
                      />
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
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
                {currentStep === 1 && "User Details"}
                {currentStep === 2 && "Websites"}
                {currentStep === 3 && "About Me"}
                {currentStep === 4 && "Notes"}
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
    </div>
  );
}

export default Page;
