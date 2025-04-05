const aiService = require('../services/aiService');
const BaseController = require('./baseController');

class AIController extends BaseController {
  constructor() {
    super(aiService);
  }

  // Handle text-to-text requests
  generateText = async (req, res, next) => {
    try {
      const { prompt, temperature, model, maxTokens, context } = req.body;
      
      if (!prompt) {
        return res.status(400).json({ 
          message: 'No prompt provided. Please include a prompt in your request.' 
        });
      }
      
      // Pass options if provided
      const options = {};
      if (temperature !== undefined) options.temperature = parseFloat(temperature);
      if (model) options.model = model;
      if (maxTokens) options.maxTokens = parseInt(maxTokens);
      
      // If there's additional context about the patient or situation
      let enhancedPrompt = prompt;
      if (context) {
        enhancedPrompt = `[Context: ${context}]\n\n${prompt}`;
      }
      
      const responseText = await this.service.textToText(enhancedPrompt, options);
      
      res.json({
        success: true,
        prompt: enhancedPrompt,
        response: responseText
      });
    } catch (error) {
      next(error);
    }
  };

  // Handle text-to-image requests
  generateImage = async (req, res, next) => {
    try {
      const { 
        prompt,
        model,
        responseFormat,
        responseExtension,
        width,
        height,
        numInferenceSteps,
        seed,
        negativePrompt 
      } = req.body;
      
      if (!prompt) {
        return res.status(400).json({ 
          message: 'No prompt provided. Please include a prompt in your request.' 
        });
      }
      
      // Build options object from provided parameters
      const options = {};
      if (model) options.model = model;
      if (responseFormat) options.responseFormat = responseFormat;
      if (responseExtension) options.responseExtension = responseExtension;
      if (width) options.width = parseInt(width);
      if (height) options.height = parseInt(height);
      if (numInferenceSteps) options.numInferenceSteps = parseInt(numInferenceSteps);
      if (seed !== undefined) options.seed = parseInt(seed);
      if (negativePrompt) options.negativePrompt = negativePrompt;
      
      // Enhance the prompt to be more medically focused if it's not already
      let enhancedPrompt = prompt;
      if (!prompt.toLowerCase().includes('medical') && 
          !prompt.toLowerCase().includes('healthcare') && 
          !prompt.toLowerCase().includes('patient') &&
          !prompt.toLowerCase().includes('hospital') &&
          !prompt.toLowerCase().includes('nurse')) {
        enhancedPrompt = `Medical visualization of ${prompt}, suitable for a healthcare application`;
      }
      
      const imageResult = await this.service.textToImage(enhancedPrompt, options);
      
      res.json({
        success: true,
        prompt: enhancedPrompt,
        ...imageResult
      });
    } catch (error) {
      next(error);
    }
  };
}

const aiController = new AIController();

module.exports = {
  generateText: aiController.generateText,
  generateImage: aiController.generateImage
}; 