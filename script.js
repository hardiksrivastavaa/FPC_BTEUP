document.addEventListener("DOMContentLoaded", function () {

    // Selecting necessary DOM elements
    const closeModalBtn = document.querySelector("#closeModal");
    const downloadPdfBtn = document.querySelector("#downloadPdf");
    const resultModal = document.querySelector("#resultModal");
    let formData = document.querySelector("#marksheetForm");

    // Adding event listener to formData submit
    formData.addEventListener("submit", getPercentages);

    // Helper function to calculate the percentage
    function calculatePercentage(obtained, total) {
        return total === 0 ? "0.00" : ((obtained / total) * 100).toFixed(2);
    }



    // Send data to Google Sheets helper function
    fetch("https://script.google.com/macros/s/AKfycbzcZujootlO90bR__YCn-v9Lle8AEorbW5ZTAxEAFdUl5KHpPRfjt6_vNLaTTN8BVJ4mQ/exec", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
    })
        .then(response => response.json())
        .then(data => console.log("✅ Success:", data))
        .catch(error => console.error("❌ Error:", error));


    // Function to calculate and display student percentages
    function getPercentages(e) {
        e.preventDefault();

        // Fetching student details from input fields
        const studentName = document.querySelector("#studentName").value.trim();
        const branchName = document.querySelector("#branchName").value.trim();
        const enrollmentNumber = document.querySelector("#enrollmentNumber").value.trim();
        const collegeName = document.querySelector("#collegeName").value.trim();
        const error = document.querySelector("#error");

        // Fetching obtained and total marks for different years/semesters
        const firstYearObtainedMarks = parseInt(document.querySelector("#obtained1").value);
        const firstYearTotalMarks = parseInt(document.querySelector("#total1").value);
        const secondYearObtainedMarks = parseInt(document.querySelector("#obtained2").value);
        const secondYearTotalMarks = parseInt(document.querySelector("#total2").value);
        const fifthSemObtainedMarks = parseInt(document.querySelector("#obtained5").value);
        const fifthSemTotalMarks = parseInt(document.querySelector("#total5").value);
        const sixthSemObtainedMarks = parseInt(document.querySelector("#obtained6").value);
        const sixthSemTotalMarks = parseInt(document.querySelector("#total6").value);

        // Clear previous error messages
        error.textContent = "";

        // Validation: Check enrollment number length
        if (enrollmentNumber.length !== 15) {
            error.textContent = "Enter a Valid Enrollment Number.";
            return;
        }

        // Validation: Ensure obtained marks are not greater than total marks
        if (firstYearObtainedMarks > firstYearTotalMarks || secondYearObtainedMarks > secondYearTotalMarks ||
            fifthSemObtainedMarks > fifthSemTotalMarks || sixthSemObtainedMarks > sixthSemTotalMarks) {
            error.textContent = "Obtained marks must be less or equal to total marks!";
            return;
        }

        // Validation: Check allowed total marks range for 1st and 2nd year
        if (firstYearTotalMarks < 1000 || secondYearTotalMarks < 1000 || firstYearTotalMarks > 2000 || secondYearTotalMarks > 2000) {
            error.textContent = "Ist/IInd Year Total Marks must be between 1000 and 2000!";
            return;
        }

        // Validation: Check allowed total marks range for 5th and 6th semester
        if (fifthSemTotalMarks < 500 || sixthSemTotalMarks < 500 || fifthSemTotalMarks > 1100 || sixthSemTotalMarks > 1100) {
            error.textContent = "5th/6th Semester Total marks must be between 500 and 1100!";
            return;
        }

        // Calculate percentages for different years/semesters

        const firstYearPercentage = calculatePercentage(firstYearObtainedMarks, firstYearTotalMarks);
        const secondYearPercentage = calculatePercentage(secondYearObtainedMarks, secondYearTotalMarks);

        const fifthSemPercentage = calculatePercentage(fifthSemObtainedMarks, fifthSemTotalMarks);
        const sixthSemPercentage = calculatePercentage(sixthSemObtainedMarks, sixthSemTotalMarks);

        const thirdYearObtainedMarks = fifthSemObtainedMarks + sixthSemObtainedMarks;
        const thirdYearTotalMarks = fifthSemTotalMarks + sixthSemTotalMarks;
        const thirdYearPercentage = calculatePercentage(thirdYearObtainedMarks, thirdYearTotalMarks);

        // Calculate final percentage based on weightage

        const finalObtainedMarks = Math.round(firstYearObtainedMarks * 0.3 + secondYearObtainedMarks * 0.7 + thirdYearObtainedMarks);
        const finalTotalMarks = Math.round(firstYearTotalMarks * 0.3 + secondYearTotalMarks * 0.7 + thirdYearTotalMarks);
        const finalPercentage = calculatePercentage(finalObtainedMarks, finalTotalMarks);

        // Determine grade and result based on final percentage
        const gradeMapping = [
            {
                min: 60,
                grade: "First Division",
                message: `Congratulations ${studentName}, your Final Percentage is ${finalPercentage}%.\nYou achieved First Division. Great job!`,
            },
            {
                min: 45,
                grade: "Second Division",
                message: `Well done ${studentName}, your Final Percentage is ${finalPercentage}%.\nYou secured Second Division. Keep pushing forward!`,
            },
            {
                min: 33,
                grade: "Third Division",
                message: `Good effort ${studentName}, your Final Percentage is ${finalPercentage}%.\nYou passed with Third Division. Try to improve further!`,
            },
            {
                min: 0,
                grade: "Fail",
                message: `Sorry ${studentName}, your Final Percentage is ${finalPercentage}%.\nYou didn't pass. Stay strong and try again!`,
            },
        ];

        // Find the correct grade
        const { grade, message } = gradeMapping.find(
            (g) => finalPercentage >= g.min
        );

        const finalResult = finalPercentage >= 33 ? "PASSED" : "FAILED";

        // Send data to Google Sheets
        sendDataToGoogleSheet(formData);

        // Display the result in modal
        document.querySelector("#modalContent").innerHTML = `
            <h2 class="text-xl font-bold">Marksheet Details</h2>
            <p><strong>Student Name:</strong> ${studentName}</p>
            <p><strong>Branch Name:</strong> ${branchName}</p>
            <p><strong>Enrollment No:</strong> ${enrollmentNumber}</p>
            <p><strong>College Name:</strong> ${collegeName}</p>
            <hr class="my-2">
            <p><strong>1st Year Percentage:</strong> ${firstYearPercentage}%</p>
            <p><strong>2nd Year Percentage:</strong> ${secondYearPercentage}%</p>
            <p><strong>3rd Year Percentage:</strong> ${thirdYearPercentage}%</p>
            <hr class="my-2">
            <p><strong>Final Percentage:</strong> ${finalPercentage}%</p>
            <p class="text-lg font-bold mt-2 ${finalResult === "PASSED" ? "text-green-600" : "text-red-600"
            }">
                Final Result: ${finalResult}
            </p>
        `;

        // Show the result modal
        resultModal.classList.remove("hidden");

        // Store marksheet data for PDF generation
        window.marksheetData = {
            studentName,
            branchName,
            enrollmentNumber,
            collegeName,
            firstYearObtainedMarks,
            firstYearTotalMarks,
            firstYearPercentage,
            secondYearObtainedMarks,
            secondYearTotalMarks,
            secondYearPercentage,
            fifthSemObtainedMarks,
            fifthSemTotalMarks,
            fifthSemPercentage,
            sixthSemObtainedMarks,
            sixthSemTotalMarks,
            sixthSemPercentage,
            thirdYearObtainedMarks,
            thirdYearTotalMarks,
            thirdYearPercentage,
            finalObtainedMarks,
            finalTotalMarks,
            finalPercentage,
            finalResult,
            grade,
            message,
        };
    }

    // Close the modal and reset the formData
    closeModalBtn.addEventListener("click", function () {
        formData.reset();
        resultModal.classList.add("hidden");
    });

    // Event listener for downloading PDF marksheet
    downloadPdfBtn.addEventListener("click", function () {
        // Ensure that jsPDF library and marksheetData are available
        if (window.jspdf && window.marksheetData) {
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF("p", "mm", "a4"); // Create a new PDF document (portrait, millimeters, A4 size)

            // Load and add the BTEUP logo to the PDF
            const img = new Image();
            img.src = "bteup.png";
            img.onload = function () {
                doc.addImage(img, "PNG", 75, 5, 60, 50);

                // Set font style for the heading
                doc.setFont("times", "bold");
                doc.setFontSize(20);
                doc.text("BOARD OF TECHNICAL EDUCATION UP", 35, 70);

                // Fetch student data from window.marksheetData
                const d = window.marksheetData;
                doc.setFontSize(16);
                doc.text(`Student Name: ${d.studentName}`, 20, 85);
                doc.text(`Branch: ${d.branchName}`, 20, 93);
                doc.text(`Enrollment No: ${d.enrollmentNumber}`, 20, 101);
                doc.text(`College: ${d.collegeName}`, 20, 109);

                // Add "Marksheet" title
                doc.setFont("times", "bold");
                doc.setFontSize(19);
                doc.text("Marksheet", 90, 125);

                // Prepare table data for marksheet
                const tableData = [
                    ["Year/Semester", "Obtained Marks", "Total Marks", "Percentage"],
                    [
                        "1st Year",
                        d.firstYearObtainedMarks,
                        d.firstYearTotalMarks,
                        d.firstYearPercentage + "%",
                    ],
                    [
                        "2nd Year",
                        d.secondYearObtainedMarks,
                        d.secondYearTotalMarks,
                        d.secondYearPercentage + "%",
                    ],
                    [
                        "5th Semester",
                        d.fifthSemObtainedMarks,
                        d.fifthSemTotalMarks,
                        calculatePercentage(d.fifthSemObtainedMarks, d.fifthSemTotalMarks) +
                        "%",
                    ],
                    [
                        "6th Semester",
                        d.sixthSemObtainedMarks,
                        d.sixthSemTotalMarks,
                        calculatePercentage(d.sixthSemObtainedMarks, d.sixthSemTotalMarks) +
                        "%",
                    ],
                    [
                        "3rd Year",
                        d.thirdYearObtainedMarks,
                        d.thirdYearTotalMarks,
                        d.thirdYearPercentage + "%",
                    ],
                    [
                        "Grand Total",
                        d.finalObtainedMarks,
                        d.finalTotalMarks,
                        d.finalPercentage + "%",
                    ],
                ];

                // Generate the table using autoTable plugin
                doc.autoTable({
                    startY: 132, // Start position of the table
                    head: [
                        ["Year/Semester", "Obtained Marks", "Total Marks", "Percentage"],
                    ],
                    body: tableData.slice(1), // Exclude header row
                    theme: "grid",
                    styles: {
                        font: "times",
                        fontSize: 15,
                        cellPadding: 2,
                        halign: "center",
                        lineColor: [44, 62, 80],
                        lineWidth: 0.2,
                        cellWidth: "wrap",
                    },
                    headStyles: {
                        fillColor: [41, 128, 185], // Header background color
                        textColor: [255, 255, 255], // Header text color
                        fontStyle: "bold",
                        fontSize: 15,
                        halign: "center",
                    },
                    alternateRowStyles: {
                        fillColor: [230, 230, 230], // Alternating row color
                    },
                    margin: { top: 30 },
                    tableWidth: "auto",
                });

                // Display pass/fail message with color-coded text
                doc.setFontSize(16);
                doc.setTextColor(d.finalPercentage >= 33 ? "green" : "red");
                doc.setLineHeightFactor(1.4);
                doc.text(d.message, 20, 214);

                // Add additional notes and disclaimer
                doc.setTextColor("red");
                doc.setFontSize(12);
                doc.text("Note : ", 15, 257);
                doc.text(
                    "1. The Final percentage is Calculated as Per BTEUP Board rules.",
                    15,
                    264
                );
                doc.text(
                    "2. Weightage : 1st Year - 30% | 2nd Year - 70% | 3rd Year - 100%.",
                    15,
                    271
                );
                doc.text("3. This is NOT an Official Marksheet.", 15, 278);
                doc.text(
                    "4. This is only for reference and Self-Calculation Purposes.",
                    15,
                    285
                );

                // Save the generated PDF file with student name
                doc.save(`${d.studentName} - Marksheet.pdf`);
            };
        } else {
            // Display an alert if required data is missing
            alert("Oops! Something went wrong. We apologize for the inconvenience.");
        }
    });
});
