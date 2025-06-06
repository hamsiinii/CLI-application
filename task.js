#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const [, , command, ...args] = process.argv;

// — File paths (relative to current working directory)
const tf = path.resolve("task.txt");
const cf = path.resolve("completed.txt");

// — Read tasks from the file
function readTasks() {
  try {
    const data = fs.readFileSync(tf, "utf8");
    return data
      .trim()
      .split("\n")
      .filter(Boolean)
      .map((line) => {
        const spaceIndex = line.indexOf(" ");
        return {
          priority: parseInt(line.slice(0, spaceIndex)),
          task: line.slice(spaceIndex + 1),
        };
      })
      .sort((a, b) => a.priority - b.priority);
  } catch {
    return [];
  }
}

// — Save tasks to the file
function writeTasks(tasks) {
  const lines = tasks.map((t) => `${t.priority} ${t.task}`);
  fs.writeFileSync(tf, lines.join("\n"));
}

// — Show command usage info
function printHelp() {
  console.log(`Usage :-
$ ./task add 2 hello world    # Add a new item with priority 2 and text \"hello world\" to the list
$ ./task ls                   # Show incomplete priority list items sorted by priority in ascending order
$ ./task del INDEX            # Delete the incomplete item with the given index
$ ./task done INDEX           # Mark the incomplete item with the given index as complete
$ ./task help                 # Show usage
$ ./task report               # Statistics`);
}

// — Main command logic
if (!command || command === "help") {
  printHelp();
} else if (command === "add") {
  const priority = parseInt(args[0]);
  const task = args.slice(1).join(" ");

  if (isNaN(priority) || !task) {
    console.log("Error: Missing tasks string. Nothing added!");
  } else {
    const tasks = readTasks();
    tasks.push({ priority, task });
    writeTasks(tasks);
    console.log(`Added task: \"${task}\" with priority ${priority}`);
  }
} else if (command === "ls") {
  const tasks = readTasks();
  if (tasks.length === 0) {
    console.log("There are no pending tasks!");
  } else {
    tasks.forEach((t, i) => {
      console.log(`${i + 1}. ${t.task} [${t.priority}]`);
    });
  }
} else if (command === "del") {
  const index = parseInt(args[0]);
  const tasks = readTasks();
  if (isNaN(index)) {
    console.log("Error: Missing NUMBER for deleting tasks.");
  } else if (index < 1 || index > tasks.length) {
    console.log(
      `Error: item with index ${index} does not exist. Nothing deleted.`
    );
  } else {
    tasks.splice(index - 1, 1);
    writeTasks(tasks);
    console.log(`Deleted item with index ${index}`);
  }
} else if (command === "done") {
  const index = parseInt(args[0]);
  const tasks = readTasks();
  if (isNaN(index)) {
    console.log("Error: Missing NUMBER for marking tasks as done.");
  } else if (index < 1 || index > tasks.length) {
    console.log(`Error: no incomplete item with index ${index} exists.`);
  } else {
    const completedTask = tasks.splice(index - 1, 1)[0];
    writeTasks(tasks);
    fs.appendFileSync(cf, `${completedTask.task}\n`);
    console.log("Marked item as done.");
  }
} else if (command === "report") {
  const tasks = readTasks();
  let completed = [];
  try {
    completed = fs.readFileSync(cf, "utf8").trim().split("\n").filter(Boolean);
  } catch {}

  console.log(`Pending : ${tasks.length}`);
  tasks.forEach((t, i) => {
    console.log(`${i + 1}. ${t.task} [${t.priority}]`);
  });

  console.log(`\nCompleted : ${completed.length}`);
  completed.forEach((task, i) => {
    console.log(`${i + 1}. ${task}`);
  });
} else {
  printHelp();
}
