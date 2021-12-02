const { Command, flags } = require("@oclif/command");
const { mdToPdf } = require("md-to-pdf");
const fs = require("fs");
const prompt = require("prompt-sync")();

const MarkdownContent = (
    assignment_name,
    student_name,
    roll_number,
    dir_name,
    file_list
) => {
    const header = `# ${assignment_name}\n`;
    const title = `### Name: ${student_name} \n ### Roll Number: ${roll_number}\n---\n\n`;

    let program_content = "";
    const ifTextFileExists = prompt("Does it have a text file?(y/n): "); //for assignments with a text file of questions
    if (ifTextFileExists.toLowerCase() === "y") {
        for (let i = 0; i < file_list.length; i++) {
            const file_name = `${dir_name}/${file_list[i]}`;
            const file_extension = file_name.substring(file_name.length - 1);
            if (file_extension === "t") { //checks for .txt file
                const data = fs.readFileSync(`${dir_name}/${file_list[i]}`);
                program_content += `# Questions:`;
                program_content += "\n";
                program_content += data;
                program_content += "\n";
                program_content += `<div class="page-break"></div>`;
                program_content += "\n\n";
            }
        }
       
    }
    let questionCount = 1;
    for (let i = 0; i < file_list.length; i++) {
        const file_name = `${dir_name}/${file_list[i]}`;
        const file_extension = file_name.substring(file_name.length - 1);
        if (file_extension === "c") { //checks for .c file
            const data = fs.readFileSync(`${dir_name}/${file_list[i]}`);
            program_content += `# Q. ${questionCount} \n\n`;
            questionCount = questionCount + 1;
            program_content += "```\n";
            program_content += data;
            program_content += "\n```\n";
        }else if (file_extension === "g") { //checks for .png/.jpeg file
            program_content += `### Output:`;
            program_content += "\n";
            program_content += `![img${i}](${file_name})`; //img path
            if (i !== file_list.length - 2) {
                program_content += `<div class="page-break"></div>`;
                program_content += "\n";
            }
        }
    }

    return `${header} ${title} ${program_content}`;
};

class CodeToPdfCommand extends Command {
    async run() {
        const { flags } = this.parse(CodeToPdfCommand);

        const dir = flags.dir;
        const output = flags.output || "assignment";

        if (dir) {
            fs.readdir(dir, async (err, files) => {
                const assignment_name = prompt("Assignment Name: ");
                const name = prompt("Enter Name: ");
                const roll_no = prompt("Enter Roll No.: ");

                const md = MarkdownContent(
                    assignment_name,
                    name,
                    roll_no,
                    dir,
                    files
                );

                fs.writeFileSync(`${output}.md`, md);

                const pdf = await mdToPdf({ path: `${output}.md` }).catch(
                    console.error
                );
                if (pdf) {
                    fs.writeFileSync(`${output}.pdf`, pdf.content);
                }
            });
        } else {
            this.log("Bruh, mention a directory");
        }
    }
}

CodeToPdfCommand.description =
    "Convert a bunch of files to an Assignment Submission";

CodeToPdfCommand.flags = {
    version: flags.version({ char: "v" }),
    help: flags.help({ char: "h" }),
    dir: flags.string({ char: "d", description: "Directory with all Files" }),
    output: flags.string({ char: "o", description: "Output File Name" }),
};

module.exports = CodeToPdfCommand;
