document.addEventListener("DOMContentLoaded", function () {
    const closeModalBtn = document.querySelector("#closeModal");
    const downloadPdfBtn = document.querySelector("#downloadPdf");
    const resultModal = document.querySelector("#resultModal");
    let form = document.querySelector("#marksheetForm");

    form.addEventListener("submit", getPercentages);

    // Helper Function to Calculate the Percentage

    function calculatePercentage(obtained, total) {
        return total === 0 ? "0.00" : ((obtained / total) * 100).toFixed(2);
    }

    // Function to get Percentages of Student

    function getPercentages(e) {

        e.preventDefault();

        const studentName = document.querySelector("#studentName").value.trim();
        const branchName = document.querySelector("#branchName").value.trim();
        const enrollmentNumber = document.querySelector("#enrollmentNumber").value.trim();
        const collegeName = document.querySelector("#collegeName").value.trim();
        const error = document.querySelector("#error");


        const obtained1 = parseInt(document.querySelector("#obtained1").value);
        const total1 = parseInt(document.querySelector("#total1").value);
        const obtained2 = parseInt(document.querySelector("#obtained2").value);
        const total2 = parseInt(document.querySelector("#total2").value);
        const obtained5 = parseInt(document.querySelector("#obtained5").value);
        const total5 = parseInt(document.querySelector("#total5").value);
        const obtained6 = parseInt(document.querySelector("#obtained6").value);
        const total6 = parseInt(document.querySelector("#total6").value);

        // Clear previous error messages
        error.textContent = "";

        // Check if Entrollment Number is less than 15 digits.
        if (enrollmentNumber.length < 15) {
            error.textContent = "Enrollment Number must be 15 digits long.";
            return;
        }

        // Check if obtained marks are greater than total marks
        if (obtained1 > total1 || obtained2 > total2 || obtained5 > total5 || obtained6 > total6) {
            error.textContent = "Obtained marks cannot be greater than total marks!";
            return;
        }

        // Check if total marks are less than the minimum required
        if (total1 < 500 || total2 < 500 || total5 < 500 || total6 < 500) {
            error.textContent = "Total marks cannot be less than 500!";
            return;
        }

        // Check if 1st and 2nd year total marks exceed the allowed limit
        if (total1 < 1000 || total2 < 1000) {
            error.textContent = "Ist/IInd Year Total Marks cannot be less than 1000!";
            return;
        }

        // Check if 1st and 2nd year total marks exceed the allowed limit
        if (total1 > 2000 || total2 > 2000) {
            error.textContent = "Ist/IInd Year Total Marks cannot be greater than 2000!";
            return;
        }

        // Check if 5th and 6th semester total marks exceed the allowed limit
        if (total5 > 1100 || total6 > 1100) {
            error.textContent = "5th/6th Semester Total marks cannot be greater than 1100!";
            return;
        }

        const firstYearPercentage = calculatePercentage(obtained1, total1);
        const secondYearPercentage = calculatePercentage(obtained2, total2);
        const thirdYearObtained = obtained5 + obtained6;
        const thirdYearTotal = total5 + total6;
        const thirdYearPercentage = calculatePercentage(thirdYearObtained, thirdYearTotal);

        const finalObtainedMarks = Math.round((obtained1 * 0.3) + (obtained2 * 0.7) + thirdYearObtained);
        const finalTotalMarks = Math.round((total1 * 0.3) + (total2 * 0.7) + thirdYearTotal);
        const finalPercentage = calculatePercentage(finalObtainedMarks, finalTotalMarks);

        // Determine grade and message based on final percentage
        let grade = "";
        let message = "";

        if (finalPercentage >= 60) {
            grade = "First Division";
            message = `Congratulations ${studentName}, your Final Percentage is ${finalPercentage}%.\nYou achieved First Division. Great job!`;
        } else if (finalPercentage >= 45) {
            grade = "Second Division";
            message = `Well done ${studentName}, your Final Percentage is ${finalPercentage}%.\nYou secured Second Division. Keep pushing forward!`;
        } else if (finalPercentage >= 33) {
            grade = "Third Division";
            message = `Good effort ${studentName}, your Final Percentage is ${finalPercentage}%.\nYou passed with Third Division. Try to improve further!`;
        } else {
            grade = "Fail";
            message = `Sorry ${studentName}, your Final Percentage is ${finalPercentage}%.\nYou didn't pass. Stay strong and try again!`;
        }

        const finalResult = finalPercentage >= 33 ? "PASSED" : "FAILED";

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
            <p class="text-lg font-bold mt-2 ${finalResult === 'PASSED' ? 'text-green-600' : 'text-red-600'}">
                Final Result: ${finalResult}
            </p>
        `;

        resultModal.classList.remove("hidden");

        window.marksheetData = {
            studentName, branchName, enrollmentNumber, collegeName,
            obtained1, total1, firstYearPercentage,
            obtained2, total2, secondYearPercentage,
            obtained5, total5, obtained6, total6,
            thirdYearObtained, thirdYearTotal, thirdYearPercentage,
            finalObtainedMarks, finalTotalMarks, finalPercentage,
            finalResult, grade, message
        };
    }

    closeModalBtn.addEventListener("click", function () {
        resultModal.classList.add("hidden");
        form.reset();
    });

    downloadPdfBtn.addEventListener("click", function () {
        if (window.jspdf && window.marksheetData) {
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF("p", "mm", "a4");

            const img = new Image();
            img.src = "bteup.png";
            img.onload = function () {
           
                doc.addImage(img, "PNG", 75, 5, 60, 50); 

                doc.setFont("times", "bold");
                doc.setFontSize(20);
                doc.text("BOARD OF TECHNICAL EDUCATION UP", 35, 70);

                const d = window.marksheetData;
                doc.setFontSize(16);
                doc.text(`Student Name: ${d.studentName}`, 20, 85);
                doc.text(`Branch: ${d.branchName}`, 20, 93);
                doc.text(`Enrollment No: ${d.enrollmentNumber}`, 20, 101);
                doc.text(`College: ${d.collegeName}`, 20, 109);

                doc.setFont("times", "bold");
                doc.setFontSize(19);
                doc.text("Marksheet", 90, 125);

                const tableData = [
                    ["Year/Semester", "Obtained Marks", "Total Marks", "Percentage"],
                    ["1st Year", d.obtained1, d.total1, d.firstYearPercentage + "%"],
                    ["2nd Year", d.obtained2, d.total2, d.secondYearPercentage + "%"],
                    ["5th Semester", d.obtained5, d.total5, calculatePercentage(d.obtained5, d.total5) + "%"],
                    ["6th Semester", d.obtained6, d.total6, calculatePercentage(d.obtained6, d.total6) + "%"],
                    ["3rd Year", d.thirdYearObtained, d.thirdYearTotal, d.thirdYearPercentage + "%"],
                    ["Grand Total", d.finalObtainedMarks, d.finalTotalMarks, d.finalPercentage + "%"],
                ];


                doc.autoTable({
                    startY: 132,
                    head: [[
                        "Year/Semester", "Obtained Marks", "Total Marks", "Percentage"
                    ]], 
                    body: tableData.slice(1),
                    theme: "grid",
                    styles: {
                        font: "times",
                        fontSize: 15, 
                        cellPadding: 3, 
                        halign: "center",
                        lineColor: [44, 62, 80], 
                        lineWidth: 0.2, 
                        cellWidth: "wrap", 
                    },
                    headStyles: {
                        fillColor: [41, 128, 185],
                        textColor: [255, 255, 255],
                        fontStyle: "bold",
                        fontSize: 15, 
                        halign: "center",
                    },
                    alternateRowStyles: {
                        fillColor: [230, 230, 230],
                    },
                    margin: { top: 30 },
                    tableWidth: "auto",
                });

                doc.setFontSize(16);
                doc.setTextColor(d.finalPercentage >= 33 ? "green" : "red");
                doc.setLineHeightFactor(1.4); 

                
                doc.text(d.message, 20, 227);

                
                doc.setTextColor("red");
                doc.setFontSize(12);
                doc.text("Note : ", 15, 257);
                doc.text("1. The Final percentage is Calculated as Per BTEUP Board rules.", 15, 264);
                doc.text("2. Weightage : 1st Year - 30% | 2nd Year - 70% | 3rd Year - 100%.", 15, 271);
                doc.text("3. This is NOT an Official Marksheet.", 15, 278);
                doc.text("4. This is only for reference and Self-Calculation Purposes.", 15, 285);


                doc.save(`${d.studentName} - Marksheet.pdf`);
            };
        } else {
            alert("Oops! Something went wrong. We apologize for the inconvenience.");
        }
    });
});
