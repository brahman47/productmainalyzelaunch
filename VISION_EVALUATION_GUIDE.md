# Vision-Based Mains Evaluation Guide

## Overview

The mains evaluation feature now uses AI vision capabilities to analyze answer sheets directly from images or PDFs. This eliminates the need for manual text entry and allows evaluation of handwritten or typed answers.

## Features

### Automatic Extraction
The AI automatically extracts:
- **Question text** from the uploaded image/PDF
- **Marks allocated** (e.g., "10 marks", "250 words")
- **Word limit** if specified
- **Answer content** (handwritten or typed)

### Multi-Question Handling
- If a PDF/image contains multiple questions, only the **first question** is evaluated
- This ensures focused, accurate evaluation

### Optional Text Inputs
- **Question field**: Optional - AI will extract from image if not provided
- **Answer text field**: Optional - AI will read from image if not provided
- **File upload**: Required - at least one image or PDF must be uploaded

## How It Works

1. **Upload Answer Sheet**
   - Drag and drop or click to browse
   - Supported formats: JPG, PNG, PDF
   - Multiple files supported (all will be analyzed together)

2. **Optional: Provide Context**
   - You can optionally type the question for reference
   - You can optionally provide answer text if needed
   - But the AI will primarily analyze the uploaded images

3. **AI Vision Analysis**
   - Gemini 2.5 Flash Lite analyzes the images
   - Extracts question, marks, word limit automatically
   - Reads handwritten or typed answers
   - Evaluates only the first question if multiple are present

4. **Comprehensive Evaluation**
   The AI provides:
   - **Score** (out of marks allocated in the image)
   - **Extracted Question** (what the AI found)
   - **Word Count Analysis** (if word limit specified)
   - **Structure Assessment**
   - **Content Quality Analysis**
   - **Presentation Feedback**
   - **Word Limit Adherence** (if applicable)
   - **Key Strengths** (bullet points)
   - **Key Weaknesses** (areas to improve)
   - **Actionable Suggestions**

## Best Practices

### Image Quality
- Use clear, well-lit photos
- Ensure text is readable
- Avoid shadows or glare
- Higher resolution is better

### Answer Sheet Format
- Write the question at the top clearly
- Include marks allocation (e.g., "Q1. [10 marks]")
- Mention word limit if applicable (e.g., "250 words")
- Write legibly if handwritten

### Multiple Questions
- If your PDF has multiple questions, only the first will be evaluated
- Consider uploading each question separately for complete evaluation

## Example Answer Sheet Format

```
Q1. Discuss the impact of climate change on Indian agriculture. (10 marks, 150 words)

[Your answer here - handwritten or typed]
```

## Technical Details

### Vision API
- Model: Google Gemini 2.5 Flash Lite
- Multimodal analysis with image_url content type
- Supports both images and PDFs
- Reads handwritten and typed text

### Evaluation Criteria
- **Structure**: Introduction, body paragraphs, conclusion, logical flow
- **Content**: Depth, accuracy, relevance, examples, analytical thinking
- **Presentation**: Clarity, grammar, coherence
- **Word Limit**: Adherence to specified constraints (if any)

### Response Time
- Typically 10-30 seconds depending on:
  - Number of images
  - Image size/resolution
  - Complexity of answer

## Troubleshooting

### "No answer files provided"
- Ensure you've uploaded at least one image or PDF
- Check file format (JPG, PNG, PDF only)

### Poor Extraction
- Improve image quality
- Ensure text is clearly visible
- Use higher resolution images
- Avoid handwriting that's too cursive

### Wrong Question Evaluated
- If your PDF has multiple questions, only the first is evaluated
- Upload questions separately for individual evaluation

## Future Enhancements

Planned features:
- [ ] Evaluate all questions in multi-question PDFs
- [ ] Compare with model answers
- [ ] Track improvement over time
- [ ] Support for diagrams/flowcharts evaluation
- [ ] Handwriting quality feedback

## Support

If you encounter issues:
1. Check image quality and format
2. Verify file size (recommend < 5MB per file)
3. Ensure question and marks are visible in the image
4. Try re-uploading with better lighting

---

**Note**: The AI vision analysis is powered by Gemini 2.5 Flash Lite and provides evaluations similar to UPSC standards, but should be used as a practice tool alongside traditional preparation methods.
