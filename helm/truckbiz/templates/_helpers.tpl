{{/* Expand the name of the chart */}}
{{- define "truckbiz.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" -}}
{{- end -}}

{{/* Fullname — includes release name */}}
{{- define "truckbiz.fullname" -}}
{{- if .Values.fullnameOverride -}}
{{- .Values.fullnameOverride | trunc 63 | trimSuffix "-" -}}
{{- else -}}
{{- $name := default .Chart.Name .Values.nameOverride -}}
{{- if contains $name .Release.Name -}}
{{- .Release.Name | trunc 63 | trimSuffix "-" -}}
{{- else -}}
{{- printf "%s-%s" .Release.Name $name | trunc 63 | trimSuffix "-" -}}
{{- end -}}
{{- end -}}
{{- end -}}

{{/* Common labels */}}
{{- define "truckbiz.labels" -}}
helm.sh/chart: {{ printf "%s-%s" .Chart.Name .Chart.Version }}
{{ include "truckbiz.selectorLabels" . }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
{{- end -}}

{{/* Selector labels */}}
{{- define "truckbiz.selectorLabels" -}}
app.kubernetes.io/name: {{ include "truckbiz.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end -}}

{{/* Backend fullname */}}
{{- define "truckbiz.backendFullname" -}}
{{- printf "%s-backend" (include "truckbiz.fullname" .) | trunc 63 | trimSuffix "-" -}}
{{- end -}}

{{/* Frontend fullname */}}
{{- define "truckbiz.frontendFullname" -}}
{{- printf "%s-frontend" (include "truckbiz.fullname" .) | trunc 63 | trimSuffix "-" -}}
{{- end -}}

{{/* ML service fullname */}}
{{- define "truckbiz.mlServiceFullname" -}}
{{- printf "%s-ml-service" (include "truckbiz.fullname" .) | trunc 63 | trimSuffix "-" -}}
{{- end -}}
