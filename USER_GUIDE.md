# 📖 CSV Report Combiner - User Guide

## Welcome to CSV Report Combiner!

This guide will help you understand how to use the CSV Report Combiner tool to merge, transform, and organize data from multiple CSV files into a single, unified report.

---

## 🎯 What is CSV Report Combiner?

CSV Report Combiner is a powerful web-based tool that helps you:

- **Combine multiple CSV files** into one unified report
- **Map columns** from different sources to match your template structure
- **Transform data** (trim, format dates, convert cases, etc.)
- **Filter rows** based on your criteria
- **Remove duplicates** intelligently
- **Create derived fields** (concatenate, calculate, etc.)
- **Download** your final merged CSV file

**All processing happens in your browser** - your data never leaves your device, ensuring maximum privacy and security.

---

## 🚀 Getting Started

### Step 1: Upload Your Template CSV File

**What to expect:**
- Click the "Click to upload template" area in the **Template CSV** card
- Select a CSV file that defines your desired output structure
- The template should contain the column headers you want in your final report

**What happens:**
- The file is parsed and displayed with:
  - File name
  - Number of rows and columns
  - List of detected column headers (first 10 shown, with count of remaining)
- Any parsing errors will be displayed in red

**Tips:**
- Your template file can be empty or have sample data - only the headers matter
- The template defines the structure of your output
- Example template columns: `Name`, `Email`, `Date`, `Status`

---

### Step 2: Upload Your Input CSV Files

**What to expect:**
- Click the "Click to upload files" area in the **Input CSV Files** card
- Select one or more CSV files containing the data you want to combine
- You can upload multiple files at once (use Ctrl+Click or Cmd+Click)

**What happens:**
- Each uploaded file is displayed in a list showing:
  - File name
  - Number of rows and columns
  - Any parsing errors (if applicable)
- Files can be removed individually using the X button

**Tips:**
- Upload all files you want to combine in one go, or add them progressively
- Files can have different structures - the tool will help map them
- Supported format: CSV files (.csv)

---

### Step 3: Provide Instructions (Optional but Recommended)

The tool offers two ways to provide instructions:

#### Quick Prompt (Simple Instructions)
**What to expect:**
- A simple text field at the top of the page
- Enter a brief description of what you want

**Example prompts:**
```
"Combine all my CSV files, remove duplicates by email, filter out inactive customers, and format dates as YYYY-MM-DD"
```

**What happens:**
- Your prompt is automatically parsed when you generate the report
- The system extracts requirements for:
  - Column mappings
  - Filters
  - Data transformations
  - Deduplication rules

#### Detailed Instructions (Comprehensive Requirements)
**What to expect:**
- A larger text area below the quick prompt
- Space to provide detailed, structured instructions

**Example detailed instructions:**
```
• Combine all input CSV files into a single report
• Map 'Customer Name' column to 'Name' in the template
• Filter out rows where Status equals 'Inactive'
• Remove duplicates based on Email address (keep first occurrence)
• Convert all date columns to YYYY-MM-DD format
• Trim whitespace from all text columns
• Create a new field 'Full Name' by concatenating First Name and Last Name
```

**What happens:**
- Instructions are parsed and used to automatically configure settings
- Manual configuration in the tabs below will take priority over parsed instructions

**Tips:**
- Be specific about column names (use quotes for exact names)
- Use clear language like "map X to Y", "filter where X equals Y"
- The system understands natural language patterns

---

### Step 4: Configure Settings (Optional - Manual Configuration)

If you prefer manual control or want to refine the automatic configuration, use the configuration tabs:

#### Mapping Tab
**What to expect:**
- Column mapping interface showing:
  - Template column (dropdown)
  - Source column (dropdown)
  - Source file filter (optional)
- "Add Mapping" button to create new mappings

**What to do:**
1. Select a template column from the first dropdown
2. Select a source column from the second dropdown
3. Optionally select a specific source file (or "All Files")
4. Click "Add Mapping" to add more mappings
5. Use the trash icon to remove mappings

**Tips:**
- Mappings connect source data to your template structure
- You can map multiple source columns to different template columns
- Auto-mapping attempts to match columns by name similarity

#### Transforms Tab
**What to expect:**
- List of data transformations to apply
- Transform types: Trim, Lowercase, Uppercase, Parse Number, Parse Date, Replace
- Options vary by transform type

**What to do:**
1. Click "Add Transform"
2. Select the column to transform
3. Select the transform type
4. Configure additional parameters if needed (e.g., date format, search/replace values)
5. Use the trash icon to remove transforms

**Common transforms:**
- **Trim**: Remove whitespace from beginning and end
- **Lowercase/Uppercase**: Convert text case
- **Parse Date**: Convert date strings to ISO format
- **Parse Number**: Convert text to numbers
- **Replace**: Find and replace text patterns

#### Filters Tab
**What to expect:**
- Filter interface with:
  - Column selector
  - Operator selector (equals, contains, greater than, etc.)
  - Value input (when applicable)

**What to do:**
1. Click "Add Filter"
2. Select the column to filter
3. Choose an operator:
   - **Equals / Not Equals**: Exact match
   - **Contains / Not Contains**: Text search
   - **Greater Than / Less Than**: Numeric comparison
   - **Is Empty / Is Not Empty**: Check for empty values
4. Enter the value (if required by operator)
5. Use the trash icon to remove filters

**Tips:**
- Multiple filters work together (AND logic)
- Filters are applied after column mapping but before other processing
- Use quotes in instructions for exact value matching

#### Dedupe Tab
**What to expect:**
- Checkbox to enable deduplication
- Column selection for key columns
- Strategy selection (Keep First, Keep Last, Merge)

**What to do:**
1. Check "Enable Deduplication"
2. Select one or more columns to use as the unique key
3. Choose a strategy:
   - **Keep First**: Keep the first occurrence
   - **Keep Last**: Keep the last occurrence
   - **Merge**: Combine values from duplicates
4. Rows with identical key column values will be deduplicated

**Tips:**
- Common key columns: Email, ID, Customer ID
- Use multiple columns for composite keys (e.g., Email + Date)
- Deduplication happens after filtering

#### Derived Fields Tab
**What to expect:**
- Interface to create new calculated fields
- Field types: Concat, Fallback, Add, Subtract, Multiply, Divide

**What to do:**
1. Click "Add Derived Field"
2. Enter a field name
3. Select a field type
4. Select source columns
5. Configure type-specific options:
   - **Concat**: Separator (e.g., space, comma)
   - **Fallback**: Default value if all sources are empty
6. Use the trash icon to remove fields

**Examples:**
- **Concat**: "Full Name" from "First Name" + "Last Name"
- **Fallback**: "Display Name" from "Nickname" or "Full Name" if empty
- **Math**: "Total" = "Price" × "Quantity"

#### Output Options Tab
**What to expect:**
- Checkboxes for output options:
  - Include Source File Column
  - Use Template Column Order

**What to do:**
- **Include Source File Column**: Adds a column showing which input file each row came from
- **Use Template Column Order**: Orders output columns to match your template (recommended)

---

### Step 5: Generate Your Report

**What to expect:**
1. Click the **"Generate Report"** button (top right)
2. The system will:
   - Parse your instructions (if provided)
   - Apply column mappings
   - Execute transforms
   - Apply filters
   - Remove duplicates
   - Create derived fields
   - Prepare the output

**Processing time:**
- Typically instant for files with hundreds of rows
- May take a few seconds for very large datasets (thousands of rows)
- All processing happens in your browser

**What happens:**
- If successful: A preview table appears showing your processed data
- If errors occur: Error messages will be displayed

---

### Step 6: Preview and Download

**Preview Table:**
- Shows the first 200 rows of processed data
- Displays columns in template order (if option enabled)
- Includes pagination if you have more than 50 rows
- Shows all columns from your template

**Download:**
1. Click the **"Download CSV"** button (top right of preview)
2. Your browser will download a CSV file named `merged-report.csv`
3. Open in Excel, Google Sheets, or any CSV viewer

**File format:**
- Standard CSV format (comma-separated values)
- UTF-8 encoding
- Headers in first row
- Compatible with all spreadsheet applications

---

## 💡 Tips and Best Practices

### Column Mapping
- **Use descriptive template headers**: Make your template headers clear and consistent
- **Match naming conventions**: If source files use "Customer Name" and template uses "Name", the auto-mapper will find it
- **Test with small files first**: Upload a few rows to test your configuration before processing large datasets

### Instructions
- **Be specific**: "Map 'Customer Name' to 'Name'" is better than "map customer to name"
- **Use quotes for exact names**: When referencing column names, use quotes: `'Column Name'`
- **List requirements clearly**: Use bullet points or numbered lists for clarity
- **Combine approaches**: Use quick prompt for overview, detailed instructions for specifics

### Data Quality
- **Check for empty values**: Use filters to remove rows with missing critical data
- **Standardize formats**: Use transforms to ensure consistent date/number formats
- **Handle duplicates early**: Configure deduplication based on your data's unique identifiers

### Performance
- **File size**: The tool handles files well, but very large files (10,000+ rows) may take longer
- **Browser compatibility**: Works best in modern browsers (Chrome, Firefox, Edge, Safari)
- **Memory**: Very large files may impact browser performance - consider splitting if needed

---

## 🔍 What to Expect: Common Scenarios

### Scenario 1: Simple Merge
**Goal**: Combine 3 customer lists into one
1. Upload template with columns: Name, Email, Phone
2. Upload 3 CSV files with customer data
3. Optionally add quick prompt: "Combine all files, remove duplicate emails"
4. Click Generate
5. Download merged file

### Scenario 2: Data Transformation
**Goal**: Standardize a messy dataset
1. Upload template with standardized columns
2. Upload input file with inconsistent formatting
3. Add instructions: "Trim all text columns, convert dates to YYYY-MM-DD, lowercase email addresses"
4. Generate and review
5. Download cleaned data

### Scenario 3: Filtered Report
**Goal**: Extract active customers only
1. Upload template
2. Upload customer database
3. Instructions: "Filter where Status equals 'Active', remove duplicates by Email"
4. Generate
5. Download filtered report

### Scenario 4: Complex Transformation
**Goal**: Create a report with derived fields
1. Upload template with: Full Name, Email, Total Spent
2. Upload sales data with: First Name, Last Name, Email, Price, Quantity
3. Instructions: "Map First Name and Last Name, create Full Name by concatenating, calculate Total Spent as Price × Quantity"
4. Configure derived fields manually if needed
5. Generate and download

---

## ⚠️ Troubleshooting

### Files Won't Upload
- **Check file format**: Must be .csv files
- **Check file size**: Very large files may cause issues
- **Check browser**: Try a different browser or clear cache

### Column Mapping Not Working
- **Check column names**: Ensure names match (case-sensitive matching available)
- **Use manual mapping**: If auto-mapping fails, configure manually in Mapping tab
- **Check template structure**: Template headers define the output structure

### Filters Not Working
- **Check operator**: Ensure you're using the right operator (equals vs contains)
- **Check value format**: Values should match the data format in your files
- **Check column selection**: Ensure you selected the correct column

### Output Missing Data
- **Check filters**: You may have filtered out the data
- **Check mappings**: Ensure all required columns are mapped
- **Check transforms**: Transforms might be converting data unexpectedly
- **Preview first**: Always preview before downloading

### Processing Takes Too Long
- **File size**: Very large files take longer
- **Complex instructions**: Many filters/transforms increase processing time
- **Browser performance**: Close other tabs or try a different browser

---

## 🎓 Example Workflow

Here's a complete example workflow:

1. **Prepare your template**:
   - Create a CSV file with headers: `Full Name, Email, Signup Date, Status`
   - Save as `template.csv`

2. **Prepare your data**:
   - Have 3 CSV files: `customers_q1.csv`, `customers_q2.csv`, `customers_q3.csv`
   - Each has columns: `First Name, Last Name, Email Address, Date, Active`

3. **Upload**:
   - Upload `template.csv` as template
   - Upload all 3 customer files as input files

4. **Instructions**:
   - Quick Prompt: "Combine all files, map First Name and Last Name to Full Name, filter active customers only, remove duplicate emails, format dates as YYYY-MM-DD"

5. **Generate**:
   - Click "Generate Report"
   - Review preview table
   - Check that data looks correct

6. **Download**:
   - Click "Download CSV"
   - Open in Excel/Sheets
   - Verify results

---

## 🔐 Privacy and Security

- **100% Client-Side Processing**: All data processing happens in your browser
- **No Server Uploads**: Your files never leave your device
- **No Data Storage**: No data is stored or logged
- **Open Source**: You can review the code if needed
- **No Account Required**: No registration or login needed

---

## 📞 Need Help?

- **Review the instructions**: The "How to Use This Tool" section on the builder page
- **Check examples**: Try the example prompts in the instruction fields
- **Start simple**: Begin with basic merge, then add complexity
- **Preview always**: Always preview before downloading to catch issues

---

## 🎉 You're Ready!

You now have everything you need to start using CSV Report Combiner effectively. Remember:

1. ✅ Upload template first
2. ✅ Upload input files
3. ✅ Provide instructions (optional but helpful)
4. ✅ Generate and preview
5. ✅ Download your report

Happy data combining! 🚀
