// Form
"use client"
import React, { useState, FormEvent, useEffect } from 'react';
import { useStore } from '@/store/store';
import axios from 'axios';
import ProgressBar from '@/components/ProgreseBar/ProgreseBar';
import { FormInput } from '@/components/ProgreseBar/FormInput';
import { CldUploadWidget ,CloudinaryUploadWidgetResults} from 'next-cloudinary';
import { useRouter } from 'next/navigation';
import Payment from '@/components/Payment/Payment';
import data from '@/Data/data.json';
import { useSession, signIn } from 'next-auth/react'
import Footer from '@/components/FormFooter/Footer';
import { PageNavigation } from '@/components/FormpageNav/PageNavigation';


interface FormDataType {
  siteTitle: string;
  subdomain: string;
  socialLinks: {
    github: string;
    linkedin: string;
    leetcode: string;
  };
  hero: {
    profileImage: string;
    name: string;
    title: string;
    description: string;
    featuredImage: string;
  };
  repo_name: {
    repo: string,
  },
  services: Array<{
    title: string;
    description: string;
  }>;
  testimonials: Array<{
    quote: string;
    author: {
      name: string;
      title: string;
      image: string;
    };
    image: string;
  }>;
  footer: {
    contact: {
      title: string;
      subtitle: string;
      email: string;
    };
    academic: {
      title: string;
      qualifications: Array<{
        name: string;
        href: string;
      }>;
    };
  };
}

function Page() {
  const { data: session } = useSession()
  const { subdomain, availability, loading, setSubdomain, setAvailability, setLoading, isPaymentComplete } = useStore();
  const [currentStep, setCurrentStep] = useState(1);
  const [isNavOpen, setIsNavOpen] = useState(false);
  const totalSteps = 7;
  const [formData, setFormData] = useState<FormDataType>({
    siteTitle: '',
    subdomain: '',
    socialLinks: {
      github: '',
      linkedin: '',
      leetcode: '',
    },
    hero: {
      profileImage: '',
      name: '',
      title: '',
      description: '',
      featuredImage: '',
    },
    repo_name: {
      repo: 'bento_portfolio',
    },
    services: Array(3).fill(null).map(() => ({ 
      title: '', 
      description: '' 
    })),
    testimonials: Array(3).fill(null).map(() => ({
      quote: '',
      author: { name: '', title: '', image: '' },
      image: '',
    })),
    footer: {
      contact: {
        title: '',
        subtitle: '',
        email: '',
      },
      academic: {
        title: '',
        qualifications: Array(3).fill(null).map(() => ({ 
          name: '', 
          href: '' 
        })),
      },
    },
  });
  const router = useRouter();

  // Get the steps for the first site (Bento Portfolio)
  const siteSteps = data.sites[0].steps;

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

  const site_name = 'Bento Portfolio';
  
  useEffect(() => {
    console.log("name",site_name);
  }, [site_name]);
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
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
        siteName: site_name
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
              name="siteTitle"
              value={formData.siteTitle}
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
          <div className="space-y-4 ">
            <h2 className="text-xl font-semibold">Social Links</h2>
            <FormInput 
              type="url" 
              name="socialLinks.github" 
              label="GitHub URL"
              id="github"
              key="github"
              value={formData.socialLinks.github}
              onChange={handleInputChange}
              placeholder="Enter your GitHub profile URL" 
            />
            <FormInput 
              type="url" 
              name="socialLinks.linkedin"
              label="LinkedIn URL"
              id="linkedin"
              key="linkedin"
              value={formData.socialLinks.linkedin}
              onChange={handleInputChange}
              placeholder="Enter your LinkedIn profile URL" 
            />
            <FormInput 
              type="url" 
              name="socialLinks.leetcode"
              label="LeetCode URL"
              id="leetcode"
              key="leetcode"
              value={formData.socialLinks.leetcode}
              onChange={handleInputChange}
              placeholder="Enter your LeetCode profile URL" 
            />
          </div>
        );
      case 3:
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Hero Section</h2>
            <ImageUploadField 
              fieldName="hero.profileImage"
              label="Profile Image"
            />
            <ImageUploadField 
              fieldName="hero.featuredImage"
              label="Featured Image"
            />
            <FormInput 
              type="text" 
              name="hero.name"
              label="Name"
              id="name"
              key="name"
              value={formData.hero.name}
              onChange={handleInputChange}
              placeholder="Enter your full name" 
            />
            <FormInput 
              type="text" 
              name="hero.title"
              label="Title"
              id="title"
              key="title"
              value={formData.hero.title}
              onChange={handleInputChange}
              placeholder="Enter your professional title" 
            />
            <FormInput 
              type="textarea" 
              name="hero.description"
              label="Description"
              id="description"
              key="description"
              value={formData.hero.description}
              onChange={handleInputChange}
              placeholder="Enter a brief description about yourself" 
              rows={3} 
            />
          </div>
        );
      case 4:
        return (
          <div className="space-y-4 !h-[370px] overflow-y-scroll">
            <h2 className="text-xl font-semibold">Services</h2>
            {[0, 1, 2].map((index) => (
              <div key={index} className="space-y-2 p-4 border rounded">
                <FormInput 
                  type="text" 
                  name={`services.${index}.title`}
                  label={`Service ${index + 1} Title`}
                  id={`service${index}Title`}
                  key={`service${index}Title`}
                  value={formData.services[index].title}
                  onChange={handleInputChange}
                  placeholder={`Service ${index + 1} Title`}
                />
                <FormInput 
                  type="textarea" 
                  name={`services.${index}.description`}
                  label={`Service ${index + 1} Description`}
                  id={`service${index}Description`}
                  key={`service${index}Description`}
                  value={formData.services[index].description}
                  onChange={handleInputChange}
                  placeholder={`Service ${index + 1} Description`}
                  rows={2} 
                />
              </div>
            ))}
          </div>
        );
      case 5:
        return (
          <div className="space-y-4 !h-[370px] overflow-y-scroll">
            <h2 className="text-xl font-semibold">Testimonials</h2>
            {[0, 1, 2].map((index) => (
              <div key={index} className="space-y-2 p-4 border rounded">
                <FormInput 
                  type="textarea" 
                  name={`testimonials.${index}.quote`}
                  label={`Testimonial ${index + 1} Quote`}
                  id={`testimonial${index}Quote`}
                  key={`testimonial${index}Quote`}
                  value={formData.testimonials[index].quote}
                  onChange={handleInputChange}
                  placeholder={`Testimonial ${index + 1} Quote`}
                  rows={3} 
                />
                <FormInput 
                  type="text" 
                  name={`testimonials.${index}.author.name`}
                  label={`Author ${index + 1} Name`}
                  id={`testimonial${index}AuthorName`}
                  key={`testimonial${index}AuthorName`}
                  value={formData.testimonials[index].author.name}
                  onChange={handleInputChange}
                  placeholder={`Author ${index + 1} Name`}
                />
                <FormInput 
                  type="text" 
                  name={`testimonials.${index}.author.title`}
                  label={`Author ${index + 1} Title`}
                  id={`testimonial${index}AuthorTitle`}
                  key={`testimonial${index}AuthorTitle`}
                  value={formData.testimonials[index].author.title}
                  onChange={handleInputChange}
                  placeholder={`Author ${index + 1} Title`}
                />
                <ImageUploadField 
                  fieldName={`testimonials.${index}.author.image`}
                  label={`Author ${index + 1} Image`}
                />
                <ImageUploadField 
                  fieldName={`testimonials.${index}.image`}
                  label={`Testimonial ${index + 1} Image`}
                />
              </div>
            ))}
          </div>
        );
      case 6:
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Contact Information</h2>
            <FormInput 
              type="text" 
              name="footer.contact.title"
              label="Contact Title"
              value={formData.footer.contact.title}
              onChange={handleInputChange}
              placeholder="Contact Title" 
            />
            <FormInput 
              type="text" 
              name="footer.contact.subtitle"
              label="Contact Subtitle"
              value={formData.footer.contact.subtitle}
              onChange={handleInputChange}
              placeholder="Contact Subtitle" 
            />
            <FormInput 
              type="email" 
              name="footer.contact.email"
              label="Contact Email"
              value={formData.footer.contact.email}
              onChange={handleInputChange}
              placeholder="Contact Email" 
            />
          </div>
        );
      case 7:
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Academic Information</h2>
            <FormInput 
              type="text" 
              name="footer.academic.title"
              label="Academic Section Title"
              value={formData.footer.academic.title}
              onChange={handleInputChange}
              placeholder="Academic Section Title" 
            />
            {[0, 1, 2].map((index) => (
              <div key={index} className="space-y-2">
                <FormInput 
                  type="text" 
                  name={`footer.academic.qualifications.${index}.name`}
                  label={`Qualification ${index + 1}`}
                  value={formData.footer.academic.qualifications[index].name}
                  onChange={handleInputChange}
                  placeholder={`Qualification ${index + 1}`} 
                />
                <FormInput 
                  type="text" 
                  name={`footer.academic.qualifications.${index}.href`}
                  label={`Qualification ${index + 1} Link`}
                  value={formData.footer.academic.qualifications[index].href}
                  onChange={handleInputChange}
                  placeholder={`Qualification ${index + 1} Link`} 
                />
              </div>
            ))}
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
                {currentStep === 1 && "Site Details"}
                {currentStep === 2 && "Social Links"}
                {currentStep === 3 && "Hero Section"}
                {currentStep === 4 && "Services"}
                {currentStep === 5 && "Testimonials"}
                {currentStep === 6 && "Contact Information"}
                {currentStep === 7 && "Academic Information"}
              </h1>
              <p className="text-gray-500 text-lg">
                Please provide all the required information for this section.
              </p>
            </div>

            {currentStep === 6 ? (
              // Contact Information outside form
              <div className="space-y-6">
                {renderStep()}
                <div className="flex justify-between pt-8">
                  <button
                    type="button"
                    onClick={prevStep}
                    className="px-6 py-3 text-[#574EFA] hover:text-[#4A3FF7] font-medium"
                  >
                    Go Back
                  </button>
                  <button
                    type="button"
                    onClick={nextStep}
                    className="ml-auto px-6 py-3 bg-[#1A1E3C] text-white rounded-lg hover:bg-[#2A2E4C] transition-colors"
                  >
                    Next Step
                  </button>
                </div>
              </div>
            ) : (
              // Form for other sections
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
                          // Check subdomain and availability before proceeding
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
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default Page;

