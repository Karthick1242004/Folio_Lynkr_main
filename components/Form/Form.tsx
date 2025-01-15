"use client"
import { useStore } from '@/store/store';
import { FormEvent } from 'react';
import axios from 'axios';

function Form() {
  const { subdomain, availability, loading, setSubdomain, setAvailability, setLoading } = useStore();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!subdomain || !availability) {
      alert("Please enter and check the availability of the subdomain.");
      return;
    }

    const formData = new FormData(e.currentTarget);
    const data = {
      siteTitle: formData.get("siteTitle") as string,
      subdomain,
      socialLinks: {
        github: formData.get("github") as string,
        linkedin: formData.get("linkedin") as string,
        leetcode: formData.get("leetcode") as string,
      },
      hero: {
        profileImage: formData.get("profileImage") as string,
        name: formData.get("name") as string,
        title: formData.get("title") as string,
        description: formData.get("description") as string,
        featuredImage: formData.get("featuredImage") as string,
      },
      services: [
        {
          title: formData.get("service1Title") as string,
          description: formData.get("service1Description") as string,
        },
        {
          title: formData.get("service2Title") as string,
          description: formData.get("service2Description") as string,
        },
        {
          title: formData.get("service3Title") as string,
          description: formData.get("service3Description") as string,
        },
      ],
      testimonials: [
        {
          quote: formData.get("testimonial1Quote") as string,
          author: {
            name: formData.get("testimonial1AuthorName") as string,
            title: formData.get("testimonial1AuthorTitle") as string,
            image: formData.get("testimonial1AuthorImage") as string,
          },
          image: formData.get("testimonial1Image") as string,
        },
        {
          quote: formData.get("testimonial2Quote") as string,
          author: {
            name: formData.get("testimonial2AuthorName") as string,
            title: formData.get("testimonial2AuthorTitle") as string,
            image: formData.get("testimonial2AuthorImage") as string,
          },
          image: formData.get("testimonial2Image") as string,
        },
        {
          quote: formData.get("testimonial3Quote") as string,
          author: {
            name: formData.get("testimonial3AuthorName") as string,
            title: formData.get("testimonial3AuthorTitle") as string,
            image: formData.get("testimonial3AuthorImage") as string,
          },
          image: formData.get("testimonial3Image") as string,
        },
      ],
      footer: {
        contact: {
          title: formData.get("contactTitle") as string,
          subtitle: formData.get("contactSubtitle") as string,
          email: formData.get("contactEmail") as string,
        },
        academic: {
          title: formData.get("academicTitle") as string,
          qualifications: [
            {
              name: formData.get("qualification1") as string,
              href: formData.get("qualification1Href") as string,
            },
            {
              name: formData.get("qualification2") as string,
              href: formData.get("qualification2Href") as string,
            },
            {
              name: formData.get("qualification3") as string,
              href: formData.get("qualification3Href") as string,
            },
          ],
        },
      },
    };

    try {
      // Step 1: Create a new Gist
      const createGistResponse = await fetch("https://folio4ubackend-production.up.railway.app/create-gist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: JSON.stringify(data, null, 2) }),
      });

      if (!createGistResponse.ok) {
        const errorData = await createGistResponse.json();
        console.error("Failed to create the Gist:", errorData);
        throw new Error(errorData.message || "Failed to create the Gist");
      }

      const { gistRawUrl } = await createGistResponse.json();
      console.log("Gist created successfully:", gistRawUrl);

      // Step 2: Update the Gist URL in the repository
      const updateGistUrlResponse = await fetch("https://folio4ubackend-production.up.railway.app/update-gist-url", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ gistRawUrl, subdomain }), // Include subdomain here
      });

      if (!updateGistUrlResponse.ok) {
        const errorData = await updateGistUrlResponse.json();
        console.error("Failed to update the Gist URL:", errorData);
        throw new Error(errorData.message || "Failed to update the Gist URL in the repository");
      }

      const successData = await updateGistUrlResponse.json();
      console.log("Repository updated successfully:", successData);

      alert("Form submitted successfully!");
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

  return (
    <>
      <div>
        <input
          type="text"
          value={subdomain}
          onChange={(e) => setSubdomain(e.target.value)}
          placeholder="Enter subdomain"
        />
        <button onClick={checkAvailability} disabled={loading}>
          {loading ? 'Checking...' : 'Check Availability'}
        </button>
        {availability && <p>{availability}</p>}
      </div>
      <div className="container mx-auto p-4 ">
        <h1 className="text-2xl font-bold mb-4">Portfolio Details Form</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Site Details */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Site Details</h2>
            <input
              type="text"
              name="siteTitle"
              placeholder="Site Title"
              className="w-full p-2 border rounded"
            />
          </div>

          {/* Social Links */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Social Links</h2>
            <input
              type="url"
              name="github"
              placeholder="GitHub URL"
              className="w-full p-2 border rounded"
            />
            <input
              type="url"
              name="linkedin"
              placeholder="LinkedIn URL"
              className="w-full p-2 border rounded"
            />
            <input
              type="url"
              name="leetcode"
              placeholder="LeetCode URL"
              className="w-full p-2 border rounded"
            />
          </div>

          {/* Hero Section */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Hero Section</h2>
            <input
              type="url"
              name="profileImage"
              placeholder="Profile Image URL"
              className="w-full p-2 border rounded"
            />
            <input
              type="text"
              name="name"
              placeholder="Name"
              className="w-full p-2 border rounded"
            />
            <input
              type="text"
              name="title"
              placeholder="Title"
              className="w-full p-2 border rounded"
            />
            <textarea
              name="description"
              placeholder="Description"
              className="w-full p-2 border rounded"
              rows={3}
            />
            <input
              type="url"
              name="featuredImage"
              placeholder="Featured Image URL"
              className="w-full p-2 border rounded"
            />
          </div>

          {/* Services */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Services</h2>
            {[1, 2, 3].map((index) => (
              <div key={index} className="space-y-2 p-4 border rounded">
                <input
                  type="text"
                  name={`service${index}Title`}
                  placeholder="Service Title"
                  className="w-full p-2 border rounded"
                />
                <textarea
                  name={`service${index}Description`}
                  placeholder="Service Description"
                  className="w-full p-2 border rounded"
                  rows={2}
                />
              </div>
            ))}
          </div>

          {/* Testimonials */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Testimonials</h2>
            {[1, 2, 3].map((index) => (
              <div key={index} className="space-y-2 p-4 border rounded">
                <textarea
                  name={`testimonial${index}Quote`}
                  placeholder="Testimonial Quote"
                  className="w-full p-2 border rounded"
                  rows={3}
                />
                <input
                  type="text"
                  name={`testimonial${index}AuthorName`}
                  placeholder="Author Name"
                  className="w-full p-2 border rounded"
                />
                <input
                  type="text"
                  name={`testimonial${index}AuthorTitle`}
                  placeholder="Author Title"
                  className="w-full p-2 border rounded"
                />
                <input
                  type="url"
                  name={`testimonial${index}AuthorImage`}
                  placeholder="Author Image URL"
                  className="w-full p-2 border rounded"
                />
                <input
                  type="url"
                  name={`testimonial${index}Image`}
                  placeholder="Testimonial Image URL"
                  className="w-full p-2 border rounded"
                />
              </div>
            ))}
          </div>

          {/* Contact Information */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Contact Information</h2>
            <input
              type="text"
              name="contactTitle"
              placeholder="Contact Title"
              className="w-full p-2 border rounded"
            />
            <input
              type="text"
              name="contactSubtitle"
              placeholder="Contact Subtitle"
              className="w-full p-2 border rounded"
            />
            <input
              type="email"
              name="contactEmail"
              placeholder="Contact Email"
              className="w-full p-2 border rounded"
            />
          </div>

          {/* Academic Information */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Academic Information</h2>
            <input
              type="text"
              name="academicTitle"
              placeholder="Academic Section Title"
              className="w-full p-2 border rounded"
            />
            {[1, 2, 3].map((index) => (
              <div key={index} className="space-y-2">
                <input
                  type="text"
                  name={`qualification${index}`}
                  placeholder={`Qualification ${index}`}
                  className="w-full p-2 border rounded"
                />
                <input
                  type="text"
                  name={`qualification${index}Href`}
                  placeholder={`Qualification ${index} Link`}
                  className="w-full p-2 border rounded"
                />
              </div>
            ))}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
          >
            Save Portfolio Details
          </button>
        </form>
      </div>
    </>
  );
}

export default Form;
