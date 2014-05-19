TEX = pdflatex -shell-escape -interaction=nonstopmode -file-line-error
BIB = bibtex

.PHONY: all view

all : report.pdf presentation.pdf

presentation: presentation.pdf

report: report.pdf

presentation.pdf : presentation.tex
	$(TEX) presentation.tex

report.pdf : report.tex report.bbl report.blg
	$(TEX) report.tex

report.bbl report.blg : report.bib report.aux
	$(BIB) report

report.aux : report.tex
	$(TEX) report.tex

report.bib : report.tex
	$(TEX) report.tex
