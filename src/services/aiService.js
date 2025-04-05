require('dotenv').config();
const BaseService = require('./baseService');
const OpenAI = require("openai");

class AIService extends BaseService {
  constructor() {
    // Pass null since this service doesn't directly use a MongoDB model
    super(null);
    
    // Initialize the OpenAI client
    this.client = new OpenAI({
      baseURL: "https://api.studio.nebius.com/v1/",
      apiKey: process.env.NEBIUS_API_KEY,
    });
  }

  /**
   * Performs text-to-text completion using the LLM model
   * @param {string} prompt - The user's input text
   * @param {Object} options - Additional options for the API call
   * @param {number} options.temperature - Controls randomness (0-1)
   * @param {string} options.model - The model to use
   * @returns {Promise<string>} - The generated text response
   */
  async textToText(prompt, options = {}) {
    try {
      // Set default options
      const defaultOptions = {
        temperature: 0.6,
        model: "meta-llama/Meta-Llama-3.1-70B-Instruct",
        maxTokens: 500
      };
      
      // Merge with provided options
      const finalOptions = { ...defaultOptions, ...options };
      
      // Medical assistant system prompt
      const systemPrompt = `You are an AI healthcare assistant for the FallGuardian patient monitoring system. 
Your primary role is to support patients, nurses, and caregivers with helpful, accurate information related to patient care, 
fall prevention, and general health inquiries.

Guidelines:
- Provide clear, concise, and compassionate responses
- Prioritize patient safety in all recommendations
- Avoid complex medical terminology when simpler terms would suffice
- For medical emergencies, always advise contacting emergency services immediately
- Never claim to diagnose conditions or replace professional medical advice
- Maintain a professional and supportive tone throughout interactions

Your expertise includes fall prevention, elder care, patient monitoring systems, general health maintenance, 
and understanding the relationship between patients and their caregivers.`;
      
      // Call the LLM API
      const completion = await this.client.chat.completions.create({
        temperature: finalOptions.temperature,
        model: finalOptions.model,
        max_tokens: finalOptions.maxTokens,
        messages: [
          {
            role: "system",
            content: systemPrompt
          },
          {
            role: "user",
            content: prompt
          }
        ]
      });
      
      // Extract the response text
      const responseText = completion.choices[0].message.content;
      
      return responseText;
    } catch (error) {
      console.error("AI Service error:", error);
      return this.handleError({
        status: 500,
        message: 'Error processing AI request',
        details: error.message
      });
    }
  }
  
  /**
   * Generates an image from a text prompt
   * @param {string} prompt - The text description of the image to generate
   * @param {Object} options - Configuration options for image generation
   * @param {string} options.model - The model to use for image generation
   * @param {string} options.responseFormat - The format of the response ('url' or 'b64_json')
   * @param {string} options.responseExtension - The image format extension (webp, png, etc.)
   * @param {number} options.width - The width of the generated image
   * @param {number} options.height - The height of the generated image
   * @param {number} options.numInferenceSteps - Number of denoising steps (affects quality and generation time)
   * @param {number} options.seed - Random seed for reproducible results (-1 for random)
   * @param {string} options.negativePrompt - Text describing what to exclude from the image
   * @returns {Promise<Object>} - The generated image data
   */
  async textToImage(prompt, options = {}) {
    try {
      // Set default options for image generation
      const defaultOptions = {
        model: "stability-ai/sdxl",
        responseFormat: "url",
        responseExtension: "webp",
        width: 512,
        height: 512,
        numInferenceSteps: 30,
        seed: -1,
        negativePrompt: ""
      };
      
      // Merge with provided options
      const finalOptions = { ...defaultOptions, ...options };
      
      // Call the image generation API
      const result = await this.client.images.generate({
        model: finalOptions.model,
        prompt: prompt,
        response_format: finalOptions.responseFormat,
        extra_body: {
          response_extension: finalOptions.responseExtension,
          width: finalOptions.width,
          height: finalOptions.height,
          num_inference_steps: finalOptions.numInferenceSteps,
          seed: finalOptions.seed,
          negative_prompt: finalOptions.negativePrompt,
        },
      });
      
      // Return the image data
      return {
        success: true,
        url: result.data[0].url,
        model: finalOptions.model,
        prompt: prompt
      };
    } catch (error) {
      console.error("AI Image Generation error:", error);
      return this.handleError({
        status: 500,
        message: 'Error generating image',
        details: error.message
      });
    }
  }
  
  // Override handleError since we're not using a MongoDB model
  handleError(error) {
    console.error('AI Service error:', error);
    
    // Format the error response
    const formattedError = {
      status: error.status || 500,
      message: error.message || 'Unknown AI service error',
      details: error.details || null
    };
    
    throw formattedError;
  }
}

module.exports = new AIService(); 