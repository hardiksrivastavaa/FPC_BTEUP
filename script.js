document.addEventListener("DOMContentLoaded", function () {
    const closeModalBtn = document.querySelector("#closeModal");
    const downloadPdfBtn = document.querySelector("#downloadPdf");
    const resultModal = document.querySelector("#resultModal");
    const submitBtn = document.querySelector("#submit");

    if (!closeModalBtn || !downloadPdfBtn || !resultModal || !submitBtn) {
        console.error("One or more modal elements are missing!");
        return;
    }

    submitBtn.addEventListener("click", function (event) {
        event.preventDefault();
        const form = document.querySelector("#marksheetForm");
        if (form.checkValidity()) {
            getPercentages();
        } else {
            form.reportValidity();
        }
    });

    function calculatePercentage(obtained, total) {
        return total === 0 ? "0.00" : ((obtained / total) * 100).toFixed(2);
    }

    function getPercentages() {
        const studentName = document.querySelector("#studentName").value;
        const branchName = document.querySelector("#branchName").value;
        const enrollmentNumber = document.querySelector("#enrollmentNumber").value;
        const collegeName = document.querySelector("#collegeName").value;
        const error1 = document.querySelector("#error1");
        const error2 = document.querySelector("#error2");


        const obtained1 = parseInt(document.querySelector("#obtained1").value) || 0;
        const total1 = parseInt(document.querySelector("#total1").value) || 1;
        const obtained2 = parseInt(document.querySelector("#obtained2").value) || 0;
        const total2 = parseInt(document.querySelector("#total2").value) || 1;
        const obtained5 = parseInt(document.querySelector("#obtained5").value) || 0;
        const total5 = parseInt(document.querySelector("#total5").value) || 1;
        const obtained6 = parseInt(document.querySelector("#obtained6").value) || 0;
        const total6 = parseInt(document.querySelector("#total6").value) || 1;

        // Clear previous error messages
        error1.textContent = "";
        error2.textContent = "";

        if (enrollmentNumber.length < 15) {
            error1.textContent = "Enrollment Number is too short. It must be 15 digits long.";
            return;
        } else if (obtained1 > total1 || obtained2 > total2 || obtained5 > total5 || obtained6 > total6) {
            error2.textContent = "Obtained marks cannot be greater than total marks!";
            return;
        } else if (total1 < 500 || total2 < 500 || total5 < 500 || total6 < 500) {
            error2.textContent = "Total marks cannot be less than 500!";
            return;
        } else if (total1 > 2000 || total2 > 2000) {
            error2.textContent = "Ist/IInd Year Total Marks cannot be greater than 2000!";
            return;
        } else if (total5 > 1100 || total6 > 1100) {
            error2.textContent = "5th/6th Semester Total marks cannot be greater than 1100!";
            return;
        }

        const firstYearPercentage = calculatePercentage(obtained1, total1);
        const secondYearPercentage = calculatePercentage(obtained2, total2);
        const thirdYearObtained = obtained5 + obtained6;
        const thirdYearTotal = total5 + total6;
        const thirdYearPercentage = calculatePercentage(thirdYearObtained, thirdYearTotal);

        const cumulativeObtained = Math.round((obtained1 * 0.3) + (obtained2 * 0.7) + thirdYearObtained);
        const cumulativeTotal = Math.round((total1 * 0.3) + (total2 * 0.7) + thirdYearTotal);
        const cumulativePercentage = calculatePercentage(cumulativeObtained, cumulativeTotal);

        const finalResult = cumulativePercentage >= 40 ? "PASSED" : "FAILED";

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
            <p><strong>Final Percentage:</strong> ${cumulativePercentage}%</p>
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
            cumulativeObtained, cumulativeTotal, cumulativePercentage,
            finalResult
        };
    }

    closeModalBtn.addEventListener("click", function () {
        resultModal.classList.add("hidden");
    });

    downloadPdfBtn.addEventListener("click", function () {
        if (window.jspdf && window.marksheetData) {
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF("p", "mm", "a4");

            const img = new Image();
            img.src = "bteup.png";
            img.onload = function () {
                // 🏫 Logo + Title Formatting
                doc.addImage(img, "PNG", 75, 5, 60, 50); // Bigger logo (W: 60, H: 30)

                doc.setFont("times", "bold");
                doc.setFontSize(20);
                doc.text("BOARD OF TECHNICAL EDUCATION UP", 35, 70); // Pushed down for spacing

                const d = window.marksheetData;
                doc.setFontSize(16);
                doc.text(`Student Name: ${d.studentName}`, 20, 85);
                doc.text(`Branch: ${d.branchName}`, 20, 93);
                doc.text(`Enrollment No: ${d.enrollmentNumber}`, 20, 101);
                doc.text(`College: ${d.collegeName}`, 20, 109);

                doc.setFont("times", "bold");
                doc.setFontSize(19);
                doc.text("Marksheet Details", 75, 125);

                const tableData = [
                    ["Year/Semester", "Obtained Marks", "Total Marks", "Percentage"],
                    ["1st Year", d.obtained1, d.total1, d.firstYearPercentage + "%"],
                    ["2nd Year", d.obtained2, d.total2, d.secondYearPercentage + "%"],
                    ["5th Semester", d.obtained5, d.total5, calculatePercentage(d.obtained5, d.total5) + "%"],
                    ["6th Semester", d.obtained6, d.total6, calculatePercentage(d.obtained6, d.total6) + "%"],
                    ["3rd Year", d.thirdYearObtained, d.thirdYearTotal, d.thirdYearPercentage + "%"],
                    ["Grand Total", d.cumulativeObtained, d.cumulativeTotal, d.cumulativePercentage + "%"],
                ];

                doc.autoTable({
                    startY: 132,
                    head: [tableData[0]],
                    body: tableData.slice(1),
                    theme: "grid",
                    styles: { font: "times", fontSize: 15, cellPadding: 3, halign: "center" },
                    headStyles: { fillColor: [41, 128, 185], textColor: [255, 255, 255], fontStyle: "bold" },
                    alternateRowStyles: { fillColor: [230, 230, 230] },
                    margin: { top: 30 },
                    tableWidth: "auto",
                });

                doc.setFontSize(18);
                doc.setTextColor(d.finalResult === "PASSED" ? "green" : "red");
                doc.text(`Final Result : ${d.finalResult} with ${d.cumulativePercentage}%`, 55, 240);





                // 📌 Add Bullet Points
                doc.setTextColor("red");
                doc.setFontSize(12);
                doc.text("1. The final percentage is calculated as Per Board Rules.", 15, 262);
                doc.text("2. 1st Year : 30% | 2nd Year : 70% | Final Year : 100%", 15, 269);
                doc.text("3. This is Not an official Marksheet.", 15, 276);
                doc.text("4. This is for your reference and self-calculation purposes only.", 15, 283);


                // doc.text("INTERNET GENERATED COPY", 65, 270);

                doc.save(`${d.studentName} - Marksheet.pdf`);
            };
        } else {
            console.error("jsPDF not loaded or marksheet data not available!");
        }
    });
});
