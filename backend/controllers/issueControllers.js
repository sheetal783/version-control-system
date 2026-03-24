import mongoose from 'mongoose';
import Issue from '../Models/issueModel.js';
import Repository from '../Models/repoModel.js';

const createIssue = async (req, res) => {
  const { repository, title, description, status = 'open' } = req.body;

  try {
    if (!title) {
      return res.status(400).json({ message: 'issue title is required' });
    }
    if (!description) {
      return res.status(400).json({ message: 'issue description is required' });
    }
    if (!repository || !mongoose.Types.ObjectId.isValid(repository)) {
      return res.status(400).json({ message: 'valid repository id is required' });
    }

    const repo = await Repository.findById(repository);
    if (!repo) {
      return res.status(404).json({ message: 'Repository not found' });
    }

    const owner = req.user;
    const newIssue = new Issue({
      title,
      description,
      status,
      owner,
      repository,
    });

    await newIssue.save();

    // Keep repo.issues in sync
    repo.issues.push(newIssue._id);
    await repo.save();

    const populatedIssue = await Issue.findById(newIssue._id)
      .populate('owner')
      .populate('repository');

    res.status(201).json({ message: 'issue created successfully', issue: populatedIssue });
  } catch (error) {
    console.error('Error creating issue:', error.message);
    res.status(500).json({ message: 'server error' });
  }
};

const getAllIssues = async (req, res) => {
  try {
    const issues = await Issue.find()
      .populate('owner')
      .populate('repository');

    res.status(200).json(issues);
  } catch (error) {
    console.error('Error fetching issues:', error.message);
    res.status(500).json({ message: 'server error' });
  }
};

const getIssueById = async (req, res) => {
  const issueId = req.params.id;
  try {
    const issue = await Issue.findById(issueId).populate('owner').populate('repository');
    if (!issue) {
      return res.status(404).json({ message: 'Issue not found' });
    }
    res.status(200).json(issue);
  } catch (error) {
    console.error('Error fetching issue by id:', error.message);
    res.status(500).json({ message: 'server error' });
  }
};

const updateIssueById = async (req, res) => {
  const issueId = req.params.id;
  const { title, description, status, repository } = req.body;

  try {
    const issue = await Issue.findById(issueId);
    if (!issue) {
      return res.status(404).json({ message: 'Issue not found' });
    }

    // Enforce ownership
    if (issue.owner?.toString() !== req.user?.toString()) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const updates = {};
    if (title !== undefined) updates.title = title;
    if (description !== undefined) updates.description = description;
    if (status !== undefined) updates.status = status;

    // If repository changes, keep repo.issues arrays in sync.
    if (repository !== undefined) {
      if (!mongoose.Types.ObjectId.isValid(repository)) {
        return res.status(400).json({ message: 'valid repository id is required' });
      }

      const oldRepoId = issue.repository?.toString();
      const newRepoId = repository?.toString();

      // Avoid duplicate entries when repositoryId is sent but didn't actually change.
      if (oldRepoId !== newRepoId) {
        const newRepo = await Repository.findById(repository);
        if (!newRepo) {
          return res.status(404).json({ message: 'Repository not found' });
        }

        const oldRepo = await Repository.findById(issue.repository);
        if (oldRepo) {
          oldRepo.issues = (oldRepo.issues || []).filter((id) => id.toString() !== issueId);
          await oldRepo.save();
        }

        newRepo.issues = (newRepo.issues || []).filter((id) => id.toString() !== issueId);
        newRepo.issues.push(issueId);
        await newRepo.save();
      }

      updates.repository = repository;
    }

    Object.assign(issue, updates);
    await issue.save();

    const populatedIssue = await Issue.findById(issueId).populate('owner').populate('repository');
    res.status(200).json({ message: 'issue updated successfully', issue: populatedIssue });
  } catch (error) {
    console.error('Error updating issue:', error.message);
    res.status(500).json({ message: 'server error' });
  }
};

const deleteIssueById = async (req, res) => {
  const issueId = req.params.id;
  try {
    const issue = await Issue.findById(issueId);
    if (!issue) {
      return res.status(404).json({ message: 'Issue not found' });
    }

    if (issue.owner?.toString() !== req.user?.toString()) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    // Remove from repository issues list
    const repo = await Repository.findById(issue.repository);
    if (repo) {
      repo.issues = (repo.issues || []).filter((id) => id.toString() !== issueId);
      await repo.save();
    }

    await Issue.deleteOne({ _id: issueId });
    res.status(200).json({ message: 'issue deleted successfully' });
  } catch (error) {
    console.error('Error deleting issue:', error.message);
    res.status(500).json({ message: 'server error' });
  }
};

export default {
  createIssue,
  getAllIssues,
  getIssueById,
  updateIssueById,
  deleteIssueById,
};